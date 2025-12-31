# =============================================================================
# Redis Module Variables
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
# Redis Configuration
# =============================================================================

variable "redis_tier" {
  type        = string
  description = "Memorystore Redis tier (BASIC or STANDARD_HA)"
  default     = "BASIC"
}

variable "memory_size_gb" {
  type        = number
  description = "Redis memory size in GB"
  default     = 1
}

variable "redis_version" {
  type        = string
  description = "Redis version"
  default     = "REDIS_7_0"
}

variable "common_labels" {
  type        = map(string)
  description = "Common labels to apply to all resources"
  default     = {}
}
