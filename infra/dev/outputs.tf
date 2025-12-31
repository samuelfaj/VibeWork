# =============================================================================
# Development Environment Outputs
# =============================================================================

# Cloud SQL
output "mysql_connection_name" {
  value       = module.cloud_sql.connection_name
  description = "Cloud SQL connection name for proxy"
}

output "mysql_public_ip" {
  value       = module.cloud_sql.public_ip
  description = "Cloud SQL public IP"
}

output "mysql_database_name" {
  value       = module.cloud_sql.database_name
  description = "Database name"
}

# Redis
output "redis_host" {
  value       = module.redis.host
  sensitive   = true
  description = "Redis host"
}

output "redis_port" {
  value       = module.redis.port
  description = "Redis port"
}

# Pub/Sub
output "pubsub_notifications_topic" {
  value       = module.pubsub.notifications_topic_id
  description = "Pub/Sub notifications topic ID"
}

output "pubsub_events_topic" {
  value       = module.pubsub.events_topic_id
  description = "Pub/Sub events topic ID"
}

# Cloud Run
output "cloud_run_url" {
  value       = module.cloud_run.service_url
  description = "Cloud Run backend service URL"
}

output "cloud_run_service_name" {
  value       = module.cloud_run.service_name
  description = "Cloud Run service name"
}

output "service_account_email" {
  value       = module.cloud_run.service_account_email
  description = "Backend service account email"
}

# URLs
output "frontend_url" {
  value       = "https://dev.vibework.app"
  description = "Frontend application URL"
}

output "api_url" {
  value       = "https://api-dev.vibework.app"
  description = "API backend URL"
}
