# =============================================================================
# MongoDB Atlas Configuration
# =============================================================================
# MongoDB Atlas is managed externally (not via Terraform).
# Connection string should be provided via environment variable:
#   MONGODB_URI=mongodb+srv://...
#
# To manage Atlas via Terraform, consider adding:
#   - mongodbatlas provider: https://registry.terraform.io/providers/mongodb/mongodbatlas
# =============================================================================

locals {
  resource_prefix = "${var.environment}-vibe"

  common_labels = {
    environment = var.environment
    managed_by  = "terraform"
    project     = "vibe-work"
  }
}

# =============================================================================
# Cloud SQL (MySQL)
# =============================================================================

resource "google_sql_database_instance" "main" {
  name             = "${local.resource_prefix}-mysql"
  database_version = "MYSQL_8_0"
  region           = var.region

  settings {
    tier = var.mysql_tier

    ip_configuration {
      ipv4_enabled = true # Set to false and configure private_network for production
      # private_network = google_compute_network.vpc.id # TODO: Add VPC for production
    }

    backup_configuration {
      enabled            = true
      binary_log_enabled = true
      start_time         = "03:00"
    }

    maintenance_window {
      day  = 7 # Sunday
      hour = 3
    }

    user_labels = local.common_labels
  }

  deletion_protection = var.environment == "prod" ? true : false
}

resource "google_sql_database" "vibe_db" {
  name     = "vibe_db"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app_user" {
  name     = "vibe_app"
  instance = google_sql_database_instance.main.name
  password = var.mysql_password
}

# =============================================================================
# Memorystore (Redis)
# =============================================================================

resource "google_redis_instance" "cache" {
  name           = "${local.resource_prefix}-redis"
  tier           = var.redis_tier
  memory_size_gb = var.redis_memory_size_gb
  region         = var.region

  redis_version = "REDIS_7_0"

  labels = local.common_labels

  # TODO: For production, configure authorized_network for VPC access
  # authorized_network = google_compute_network.vpc.id
}

# =============================================================================
# Pub/Sub Topics and Subscriptions
# =============================================================================

resource "google_pubsub_topic" "notifications" {
  name   = "${local.resource_prefix}-notifications"
  labels = local.common_labels

  message_retention_duration = "604800s" # 7 days
}

resource "google_pubsub_subscription" "notifications_sub" {
  name  = "${local.resource_prefix}-notifications-sub"
  topic = google_pubsub_topic.notifications.id

  ack_deadline_seconds       = 20
  message_retention_duration = "604800s"

  labels = local.common_labels

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}

resource "google_pubsub_topic" "events" {
  name   = "${local.resource_prefix}-events"
  labels = local.common_labels

  message_retention_duration = "604800s"
}

resource "google_pubsub_subscription" "events_sub" {
  name  = "${local.resource_prefix}-events-sub"
  topic = google_pubsub_topic.events.id

  ack_deadline_seconds       = 20
  message_retention_duration = "604800s"

  labels = local.common_labels

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }
}

# =============================================================================
# Cloud Run (Backend Service)
# =============================================================================

resource "google_cloud_run_service" "backend" {
  name     = "${local.resource_prefix}-backend"
  location = var.region

  template {
    spec {
      containers {
        image = var.backend_image

        ports {
          container_port = 3000
        }

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        env {
          name  = "NODE_ENV"
          value = var.environment == "prod" ? "production" : "development"
        }

        env {
          name  = "PORT"
          value = "3000"
        }

        # Database connection - use Cloud SQL proxy or direct connection
        env {
          name  = "DATABASE_HOST"
          value = google_sql_database_instance.main.private_ip_address
        }

        env {
          name  = "REDIS_HOST"
          value = google_redis_instance.cache.host
        }

        env {
          name  = "PUBSUB_NOTIFICATIONS_TOPIC"
          value = google_pubsub_topic.notifications.id
        }

        env {
          name  = "PUBSUB_EVENTS_TOPIC"
          value = google_pubsub_topic.events.id
        }
      }
    }

    metadata {
      labels = local.common_labels

      annotations = {
        "autoscaling.knative.dev/minScale" = "0"
        "autoscaling.knative.dev/maxScale" = var.environment == "prod" ? "10" : "2"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_sql_database_instance.main,
    google_redis_instance.cache,
    google_pubsub_topic.notifications,
    google_pubsub_topic.events
  ]
}

# Allow unauthenticated access (configure IAM for production)
resource "google_cloud_run_service_iam_member" "public_access" {
  count = var.environment != "prod" ? 1 : 0

  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
