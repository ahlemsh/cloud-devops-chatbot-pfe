# 📌 Machine Virtuelle Gestion (VM-Gestion)
resource "azurestack_virtual_machine" "vm_gestion" {
  name                  = "VM-Gestion"
  location              = var.location
  resource_group_name   = var.resource_group_name
  network_interface_ids = [azurestack_network_interface.nic_gestion.id]
  vm_size               = var.vm_size

  storage_os_disk {
    name              = "osdisk-gestion"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

  storage_image_reference {
    publisher = "canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "2022.04.19"
  }


  os_profile {
    computer_name  = "vm-gestion"
    admin_username = "adminuser"
    admin_password = var.vm_admin_password

  }

  os_profile_linux_config {
  disable_password_authentication = false
}


  tags = {
    Environment = "Production"
    Role        = "Gestion"
  }
}

# 📌 Machine Virtuelle Intelligence Artificielle (VM-IA)
resource "azurestack_virtual_machine" "vm_ia" {
  name                  = "VM-IA"
  location              = var.location
  resource_group_name   = var.resource_group_name
  network_interface_ids = [azurestack_network_interface.nic_ia.id]
  vm_size               = var.vm_size

  storage_os_disk {
    name              = "osdisk-ia"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

  storage_image_reference {
    publisher = "canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "2022.04.19"
  }

  os_profile {
    computer_name  = "vm-ia"
    admin_username = "adminuser"
    admin_password = var.vm_admin_password

  }

  os_profile_linux_config {
  disable_password_authentication = false
}

  tags = {
    Environment = "Production"
    Role        = "IA"
  }
}

# 📌 Machine Virtuelle Base de Données (VM-DB)
resource "azurestack_virtual_machine" "vm_db" {
  name                  = "VM-DB"
  location              = var.location
  resource_group_name   = var.resource_group_name
  network_interface_ids = [azurestack_network_interface.nic_db.id]
  vm_size               = var.vm_size

  storage_os_disk {
    name              = "osdisk-db"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

 storage_image_reference {
  publisher = "canonical"
  offer     = "UbuntuServer"
  sku       = "18.04-LTS"
  version   = "2022.04.19"
}


  os_profile {
    computer_name  = "vm-db"
    admin_username = "adminuser"
    admin_password = var.vm_admin_password

  }
  os_profile_linux_config {
  disable_password_authentication = false
}

  tags = {
    Environment = "Production"
    Role        = "Database"
  }
}