# =============================================================================
# Google Cloud SQL (MySQL) Module
# =============================================================================

resource "google_sql_database_instance" "main" {
  name             = "${var.project_name}-${var.environment}-mysql"
  database_version = "MYSQL_8_0"
  region           = var.gcp_region

  settings {
    tier = var.mysql_tier

    ip_configuration {
      ipv4_enabled = true # Set to false and configure private_network for production
      # private_network = var.vpc_network_id # TODO: Add VPC for production

      dynamic "authorized_networks" {
        for_each = var.authorized_networks
        content {
          name  = authorized_networks.value.name
          value = authorized_networks.value.cidr
        }
      }
    }

    backup_configuration {
      enabled            = var.backup_enabled
      binary_log_enabled = var.backup_enabled
      start_time         = "03:00"
    }

    maintenance_window {
      day  = 7 # Sunday
      hour = 3
    }

    user_labels = var.common_labels
  }

  deletion_protection = var.deletion_protection
}

resource "google_sql_database" "main" {
  name     = var.database_name
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app_user" {
  name     = var.database_user
  instance = google_sql_database_instance.main.name
  password = var.database_password
}
