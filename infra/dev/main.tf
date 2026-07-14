# VibeWork — Development (MySQL + Cloud Run only)

locals {
  environment  = "dev"
  project_name = "vibe"
  domain_name  = "vibework.app"

  common_labels = {
    environment = local.environment
    project     = local.project_name
    managed_by  = "terraform"
  }
}

module "cloud_sql" {
  source = "../modules/cloud-sql"

  project_name      = local.project_name
  environment       = local.environment
  gcp_region        = var.gcp_region
  mysql_tier        = "db-f1-micro"
  database_name     = "vibe_db"
  database_user     = "vibe_app"
  database_password = var.mysql_password

  deletion_protection = false
  backup_enabled      = true
  authorized_networks = var.authorized_networks
  common_labels       = local.common_labels
}

module "cloud_run" {
  source = "../modules/cloud-run"

  project_name   = local.project_name
  environment    = local.environment
  gcp_project_id = var.gcp_project_id
  gcp_region     = var.gcp_region

  backend_image = var.backend_image
  cpu_limit     = "1000m"
  memory_limit  = "512Mi"
  min_instances = 0
  max_instances = 2

  allow_public_access = true

  environment_variables = {
    MYSQL_HOST     = module.cloud_sql.public_ip
    MYSQL_DATABASE = module.cloud_sql.database_name
    MYSQL_USER     = module.cloud_sql.database_user
    FRONTEND_URL   = "https://${local.environment}.${local.domain_name}"
    RUN_MIGRATIONS = "true"
  }

  common_labels = local.common_labels
  depends_on    = [module.cloud_sql]
}
