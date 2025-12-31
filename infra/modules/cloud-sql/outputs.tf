# =============================================================================
# Cloud SQL Module Outputs
# =============================================================================

output "instance_name" {
  value       = google_sql_database_instance.main.name
  description = "Cloud SQL instance name"
}

output "connection_name" {
  value       = google_sql_database_instance.main.connection_name
  description = "Cloud SQL instance connection name for Cloud SQL Proxy"
}

output "public_ip" {
  value       = google_sql_database_instance.main.public_ip_address
  description = "Cloud SQL public IP address"
}

output "private_ip" {
  value       = google_sql_database_instance.main.private_ip_address
  sensitive   = true
  description = "Cloud SQL private IP address"
}

output "database_name" {
  value       = google_sql_database.main.name
  description = "Database name"
}

output "database_user" {
  value       = google_sql_user.app_user.name
  description = "Database user name"
}
