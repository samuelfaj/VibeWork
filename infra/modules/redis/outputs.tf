# =============================================================================
# Redis Module Outputs
# =============================================================================

output "instance_name" {
  value       = google_redis_instance.cache.name
  description = "Redis instance name"
}

output "host" {
  value       = google_redis_instance.cache.host
  sensitive   = true
  description = "Redis host address"
}

output "port" {
  value       = google_redis_instance.cache.port
  description = "Redis port"
}

output "current_location_id" {
  value       = google_redis_instance.cache.current_location_id
  description = "Current location ID of Redis instance"
}
