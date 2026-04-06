output "app_public_ip" {
  description = "Public IP of the app VM"
  value       = oci_core_instance.app.public_ip
}

output "app_private_ip" {
  description = "Private IP of the app VM"
  value       = oci_core_instance.app.private_ip
}

output "app_id" {
  description = "OCID of the app VM"
  value       = oci_core_instance.app.id
}

output "app_ssh" {
  description = "SSH command to connect to app server"
  value       = "ssh ubuntu@${oci_core_instance.app.public_ip}"
}

output "db_public_ip" {
  description = "Public IP of the DB VM"
  value       = oci_core_instance.db.public_ip
}

output "db_private_ip" {
  description = "Private IP of the DB VM"
  value       = oci_core_instance.db.private_ip
}

output "db_id" {
  description = "OCID of the DB VM"
  value       = oci_core_instance.db.id
}

output "db_ssh" {
  description = "SSH command to connect to DB server"
  value       = "ssh ubuntu@${oci_core_instance.db.public_ip}"
}
