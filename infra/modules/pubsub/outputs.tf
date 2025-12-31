# =============================================================================
# Pub/Sub Module Outputs
# =============================================================================

# Notifications
output "notifications_topic_id" {
  value       = google_pubsub_topic.notifications.id
  description = "Pub/Sub notifications topic ID"
}

output "notifications_topic_name" {
  value       = google_pubsub_topic.notifications.name
  description = "Pub/Sub notifications topic name"
}

output "notifications_subscription_id" {
  value       = google_pubsub_subscription.notifications_sub.id
  description = "Pub/Sub notifications subscription ID"
}

# Events
output "events_topic_id" {
  value       = google_pubsub_topic.events.id
  description = "Pub/Sub events topic ID"
}

output "events_topic_name" {
  value       = google_pubsub_topic.events.name
  description = "Pub/Sub events topic name"
}

output "events_subscription_id" {
  value       = google_pubsub_subscription.events_sub.id
  description = "Pub/Sub events subscription ID"
}
