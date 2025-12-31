# =============================================================================
# VibeWork Infrastructure - Staging Environment
# =============================================================================

locals {
  environment  = "staging"
  project_name = "vibe"
  domain_name  = "vibework.app" # TODO: Update with actual domain

  common_labels = {
    environment = local.environment
    project     = local.project_name
    managed_by  = "terraform"
  }
}

# =============================================================================
# Cloud SQL (MySQL) Module
# =============================================================================

module "cloud_sql" {
  source = "../modules/cloud-sql"

  project_name      = local.project_name
  environment       = local.environment
  gcp_region        = var.gcp_region
  mysql_tier        = "db-g1-small"
  database_name     = "vibe_db"
  database_user     = "vibe_app"
  database_password = var.mysql_password

  deletion_protection = false
  backup_enabled      = true

  authorized_networks = var.authorized_networks

  common_labels = local.common_labels
}

# =============================================================================
# Redis (Memorystore) Module
# =============================================================================

module "redis" {
  source = "../modules/redis"

  project_name   = local.project_name
  environment    = local.environment
  gcp_region     = var.gcp_region
  redis_tier     = "BASIC"
  memory_size_gb = 2

  common_labels = local.common_labels
}

# =============================================================================
# Pub/Sub Module
# =============================================================================

module "pubsub" {
  source = "../modules/pubsub"

  project_name = local.project_name
  environment  = local.environment

  common_labels = local.common_labels
}

# =============================================================================
# Cloud Run Backend Module
# =============================================================================

module "cloud_run" {
  source = "../modules/cloud-run"

  project_name   = local.project_name
  environment    = local.environment
  gcp_project_id = var.gcp_project_id
  gcp_region     = var.gcp_region

  # Cloud Run configuration - Staging
  backend_image = var.backend_image
  cpu_limit     = "1000m"
  memory_limit  = "1Gi"
  min_instances = 1
  max_instances = 5

  allow_public_access = true

  environment_variables = {
    DATABASE_HOST               = module.cloud_sql.public_ip
    DATABASE_NAME               = module.cloud_sql.database_name
    DATABASE_USER               = module.cloud_sql.database_user
    REDIS_HOST                  = module.redis.host
    REDIS_PORT                  = tostring(module.redis.port)
    PUBSUB_NOTIFICATIONS_TOPIC  = module.pubsub.notifications_topic_id
    PUBSUB_EVENTS_TOPIC         = module.pubsub.events_topic_id
    FRONTEND_URL                = "https://${local.environment}.${local.domain_name}"
    API_URL                     = "https://api-${local.environment}.${local.domain_name}"
  }

  common_labels = local.common_labels

  depends_on = [
    module.cloud_sql,
    module.redis,
    module.pubsub
  ]
}
