variable "project_id" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type        = string
  default     = "us-central1"
  description = "GCP region for resources"
}

variable "environment" {
  type        = string
  default     = "dev"
  description = "Environment name (dev, staging, prod)"
}

variable "mysql_tier" {
  type        = string
  default     = "db-f1-micro"
  description = "Cloud SQL instance tier"
}

variable "mysql_password" {
  type        = string
  sensitive   = true
  description = "MySQL root password"
}

variable "redis_tier" {
  type        = string
  default     = "BASIC"
  description = "Memorystore Redis tier (BASIC or STANDARD_HA)"
}

variable "redis_memory_size_gb" {
  type        = number
  default     = 1
  description = "Redis memory size in GB"
}

variable "backend_image" {
  type        = string
  default     = "gcr.io/PROJECT_ID/vibe-backend:latest"
  description = "Backend container image URL"
}
