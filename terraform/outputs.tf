output "fortigate_public_ip" {
  value = azurestack_public_ip.fortigate.ip_address
}

output "fortigate_private_ip" {
  value = azurestack_network_interface.nic_fortigate_private.private_ip_address
}

output "vm_gestion_public_ip" {
  value = azurestack_public_ip.vm_gestion_public_ip.ip_address
}

output "vm_ia_public_ip" {
  value = azurestack_public_ip.vm_ia_public_ip.ip_address
}

output "vm_db_private_ip" {
  value = azurestack_network_interface.nic_db.private_ip_address
}
