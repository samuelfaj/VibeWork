output "mysql_connection_name" {
  value       = module.cloud_sql.connection_name
  description = "Cloud SQL connection name"
}

output "mysql_public_ip" {
  value       = module.cloud_sql.public_ip
  description = "Cloud SQL public IP"
}

output "mysql_database_name" {
  value       = module.cloud_sql.database_name
  description = "Database name"
}

output "cloud_run_url" {
  value       = module.cloud_run.service_url
  description = "Cloud Run backend URL"
}

output "cloud_run_service_name" {
  value       = module.cloud_run.service_name
  description = "Cloud Run service name"
}

output "service_account_email" {
  value       = module.cloud_run.service_account_email
  description = "Backend service account"
}

output "frontend_url" {
  value       = "https://vibework.app"
  description = "Frontend URL"
}

output "api_url" {
  value       = "https://api.vibework.app"
  description = "API URL"
}
