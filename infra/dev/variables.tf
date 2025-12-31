# =============================================================================
# Development Environment Variables
# =============================================================================

# GCP
variable "gcp_project_id" {
  type        = string
  description = "GCP project ID"
}

variable "gcp_region" {
  type        = string
  description = "GCP region"
  default     = "us-central1"
}

# Backend
variable "backend_image" {
  type        = string
  description = "Backend container image URL"
  default     = "gcr.io/PROJECT_ID/vibe-backend:latest"
}

# Database
variable "mysql_password" {
  type        = string
  sensitive   = true
  description = "MySQL password"
}

variable "authorized_networks" {
  type = list(object({
    name = string
    cidr = string
  }))
  description = "List of authorized networks for Cloud SQL access"
  default     = []
}
