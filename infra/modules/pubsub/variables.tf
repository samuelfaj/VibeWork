# =============================================================================
# Pub/Sub Module Variables
# =============================================================================

variable "project_name" {
  type        = string
  description = "Project name for resource naming"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

# =============================================================================
# Pub/Sub Configuration
# =============================================================================

variable "message_retention_duration" {
  type        = string
  description = "Message retention duration"
  default     = "604800s" # 7 days
}

variable "ack_deadline_seconds" {
  type        = number
  description = "Acknowledgement deadline in seconds"
  default     = 20
}

variable "retry_minimum_backoff" {
  type        = string
  description = "Minimum backoff for retries"
  default     = "10s"
}

variable "retry_maximum_backoff" {
  type        = string
  description = "Maximum backoff for retries"
  default     = "600s"
}

variable "common_labels" {
  type        = map(string)
  description = "Common labels to apply to all resources"
  default     = {}
}
