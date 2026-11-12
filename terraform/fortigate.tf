resource "azurestack_virtual_machine" "fortigate" {
  name                  = "VM-FortiGate"
  location              = var.location
  resource_group_name   = var.resource_group_name
  network_interface_ids = [
  azurestack_network_interface.nic_fortigate_public.id
]
  vm_size               = "Standard_D3_v2"

  storage_os_disk {
    name              = "osdisk-fortigate"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

 storage_image_reference {
  publisher = "fortinet"
  offer     = "fortinet-fortigate_vm-azurestack"
  sku       = "fortinet-fortigate_vm-azurestack"
  version   = "7.2.5"
}

  os_profile {
    computer_name  = "fortigate"
    admin_username = "adminuser"
    admin_password = var.fortigate_admin_password
  }
  os_profile_linux_config {
  disable_password_authentication = false
}


  tags = {
    Environment = "Security"
    Role        = "Firewall"
  }
}

# 📌 Public IP pour FortiGate
resource "azurestack_public_ip" "fortigate" {
  name                = "fortigate-public-ip"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
}

# 📌 Interface Réseau pour FortiGate (Public)
resource "azurestack_network_interface" "nic_fortigate_public" {
  name                = "nic-fortigate-public"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurestack_subnet.subnet_public.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurestack_public_ip.fortigate.id
    primary                       = true
  }
}

# 📌 Interface Réseau pour FortiGate (Privé)
resource "azurestack_network_interface" "nic_fortigate_private" {
  name                = "nic-fortigate-private"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig2"
    subnet_id                     = azurestack_subnet.subnet_private.id
    private_ip_address_allocation = "Dynamic"
  }
}

