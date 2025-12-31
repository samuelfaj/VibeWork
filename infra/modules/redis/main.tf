# =============================================================================
# Google Memorystore (Redis) Module
# =============================================================================

resource "google_redis_instance" "cache" {
  name           = "${var.project_name}-${var.environment}-redis"
  tier           = var.redis_tier
  memory_size_gb = var.memory_size_gb
  region         = var.gcp_region

  redis_version = var.redis_version

  display_name = "${var.project_name} ${var.environment} Redis Cache"

  labels = var.common_labels

  # TODO: For production, configure authorized_network for VPC access
  # authorized_network = var.vpc_network_id
}
