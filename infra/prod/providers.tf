# =============================================================================
# Production Environment - Providers
# =============================================================================

terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # Remote state in GCS
  # TODO: Create bucket before first apply
  # backend "gcs" {
  #   bucket = "vibework-terraform-state"
  #   prefix = "infra/prod"
  # }
}

# GCP Provider
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
