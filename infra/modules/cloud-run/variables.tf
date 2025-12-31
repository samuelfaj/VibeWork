# =============================================================================
# Cloud Run Module Variables
# =============================================================================

variable "project_name" {
  type        = string
  description = "Project name for resource naming"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "gcp_project_id" {
  type        = string
  description = "GCP project ID"
}

variable "gcp_region" {
  type        = string
  description = "GCP region for resources"
  default     = "us-central1"
}

# =============================================================================
# Cloud Run Configuration
# =============================================================================

variable "backend_image" {
  type        = string
  description = "Backend container image URL"
}

variable "container_port" {
  type        = number
  description = "Container port"
  default     = 3000
}

variable "cpu_limit" {
  type        = string
  description = "CPU limit for Cloud Run"
  default     = "1000m"
}

variable "memory_limit" {
  type        = string
  description = "Memory limit for Cloud Run"
  default     = "512Mi"
}

variable "min_instances" {
  type        = number
  description = "Minimum number of instances"
  default     = 0
}

variable "max_instances" {
  type        = number
  description = "Maximum number of instances"
  default     = 2
}

variable "allow_public_access" {
  type        = bool
  description = "Allow unauthenticated access to Cloud Run"
  default     = true
}

# =============================================================================
# Environment Variables
# =============================================================================

variable "environment_variables" {
  type        = map(string)
  description = "Additional environment variables for Cloud Run"
  default     = {}
}

variable "common_labels" {
  type        = map(string)
  description = "Common labels to apply to all resources"
  default     = {}
}
