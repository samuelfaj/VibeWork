# =============================================================================
# Cloud SQL Module Variables
# =============================================================================

variable "project_name" {
  type        = string
  description = "Project name for resource naming"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "gcp_region" {
  type        = string
  description = "GCP region for resources"
  default     = "us-central1"
}

# =============================================================================
# MySQL Configuration
# =============================================================================

variable "mysql_tier" {
  type        = string
  description = "Cloud SQL instance tier"
  default     = "db-f1-micro"
}

variable "database_name" {
  type        = string
  description = "Database name"
  default     = "vibe_db"
}

variable "database_user" {
  type        = string
  description = "Database user name"
  default     = "vibe_app"
}

variable "database_password" {
  type        = string
  sensitive   = true
  description = "Database password"
}

variable "deletion_protection" {
  type        = bool
  description = "Enable deletion protection"
  default     = false
}

variable "backup_enabled" {
  type        = bool
  description = "Enable automated backups"
  default     = true
}

variable "authorized_networks" {
  type = list(object({
    name = string
    cidr = string
  }))
  description = "List of authorized networks for Cloud SQL access"
  default     = []
}

variable "common_labels" {
  type        = map(string)
  description = "Common labels to apply to all resources"
  default     = {}
}
