
# 📌 Interface Réseau pour la VM Gestion 
resource "azurestack_public_ip" "vm_gestion_public_ip" {
  name                = "vm-gestion-public-ip"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
}

resource "azurestack_network_interface" "nic_gestion" {
  name                = "nic-vm-gestion"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurestack_subnet.subnet_gestion.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurestack_public_ip.vm_gestion_public_ip.id
  }
}

# 📌 Interface Réseau pour la VM IA 
resource "azurestack_public_ip" "vm_ia_public_ip" {
  name                = "vm-ia-public-ip"
  location            = var.location
  resource_group_name = var.resource_group_name
  allocation_method   = "Static"
}

resource "azurestack_network_interface" "nic_ia" {
  name                = "nic-vm-ia"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurestack_subnet.subnet_ia.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurestack_public_ip.vm_ia_public_ip.id
  }
}

# 📌 Interface Réseau pour la VM Base de Données (Sans IP publique)
resource "azurestack_network_interface" "nic_db" {
  name                = "nic-db"
  location            = var.location
  resource_group_name = var.resource_group_name

  ip_configuration {
    name                          = "ipconfig1"
    subnet_id                     = azurestack_subnet.subnet_private.id
    private_ip_address_allocation = "Dynamic"
  }
}

