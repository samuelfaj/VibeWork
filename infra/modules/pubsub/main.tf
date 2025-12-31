# =============================================================================
# Google Cloud Pub/Sub Module
# =============================================================================

# =============================================================================
# Notifications Topic
# =============================================================================

resource "google_pubsub_topic" "notifications" {
  name   = "${var.project_name}-${var.environment}-notifications"
  labels = var.common_labels

  message_retention_duration = var.message_retention_duration
}

resource "google_pubsub_subscription" "notifications_sub" {
  name  = "${var.project_name}-${var.environment}-notifications-sub"
  topic = google_pubsub_topic.notifications.id

  ack_deadline_seconds       = var.ack_deadline_seconds
  message_retention_duration = var.message_retention_duration

  labels = var.common_labels

  retry_policy {
    minimum_backoff = var.retry_minimum_backoff
    maximum_backoff = var.retry_maximum_backoff
  }
}

# =============================================================================
# Events Topic
# =============================================================================

resource "google_pubsub_topic" "events" {
  name   = "${var.project_name}-${var.environment}-events"
  labels = var.common_labels

  message_retention_duration = var.message_retention_duration
}

resource "google_pubsub_subscription" "events_sub" {
  name  = "${var.project_name}-${var.environment}-events-sub"
  topic = google_pubsub_topic.events.id

  ack_deadline_seconds       = var.ack_deadline_seconds
  message_retention_duration = var.message_retention_duration

  labels = var.common_labels

  retry_policy {
    minimum_backoff = var.retry_minimum_backoff
    maximum_backoff = var.retry_maximum_backoff
  }
}
