# =============================================================================
# Cloud Run Module Outputs
# =============================================================================

output "service_name" {
  value       = google_cloud_run_v2_service.backend.name
  description = "Cloud Run service name"
}

output "service_url" {
  value       = google_cloud_run_v2_service.backend.uri
  description = "Cloud Run service URL"
}

output "service_location" {
  value       = google_cloud_run_v2_service.backend.location
  description = "Cloud Run service location"
}

output "service_account_email" {
  value       = google_service_account.backend.email
  description = "Backend service account email"
}
