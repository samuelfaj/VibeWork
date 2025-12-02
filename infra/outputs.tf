output "mysql_connection_name" {
  value       = google_sql_database_instance.main.connection_name
  description = "Cloud SQL instance connection name"
}

output "mysql_private_ip" {
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
  description = "Cloud SQL private IP address"
}

output "redis_host" {
  value       = google_redis_instance.cache.host
  sensitive   = true
  description = "Memorystore Redis host"
}

output "redis_port" {
  value       = google_redis_instance.cache.port
  description = "Memorystore Redis port"
}

output "pubsub_notifications_topic" {
  value       = google_pubsub_topic.notifications.id
  description = "Pub/Sub notifications topic ID"
}

output "pubsub_events_topic" {
  value       = google_pubsub_topic.events.id
  description = "Pub/Sub events topic ID"
}

output "cloud_run_url" {
  value       = google_cloud_run_service.backend.status[0].url
  description = "Cloud Run backend service URL"
}
