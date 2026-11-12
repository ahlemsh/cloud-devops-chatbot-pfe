# 📌 Création du Virtual Network
resource "azurestack_virtual_network" "vnet" {
  name                = "vnet-cloud"
  location            = azurestack_resource_group.rg.location
  resource_group_name = azurestack_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]

  tags = {
    Environment = "Production"
    Project     = "Chatbot"
  }
}

# 📌 Subnet pour AKS (Workers)
resource "azurestack_subnet" "subnet_aks1" {
  name                 = "subnet-aks1"
  resource_group_name  = azurestack_resource_group.rg.name
  virtual_network_name = azurestack_virtual_network.vnet.name
  address_prefix   = "10.0.1.0/24"

}

# 📌 Subnet pour AKS (Master)
resource "azurestack_subnet" "subnet_aks2" {
  name                 = "subnet-aks2"
  resource_group_name  = azurestack_resource_group.rg.name
  virtual_network_name = azurestack_virtual_network.vnet.name
  address_prefix  = "10.0.2.0/24"

}

# 📌 Subnet pour VM de gestion
resource "azurestack_subnet" "subnet_gestion" {
  name                 = "subnet-gestion"
  resource_group_name  = azurestack_resource_group.rg.name
  virtual_network_name = azurestack_virtual_network.vnet.name
  address_prefix   = "10.0.3.0/24"
}

# 📌 Subnet pour VM IA
resource "azurestack_subnet" "subnet_ia" {
  name                 = "subnet-ia"
  resource_group_name  = azurestack_resource_group.rg.name
  virtual_network_name = azurestack_virtual_network.vnet.name
  address_prefix  = "10.0.4.0/24"
}


# 📌 Subnet Public (Pour FortiGate et accès Internet)
resource "azurestack_subnet" "subnet_public" {
  name                 = "subnet-public"
  resource_group_name  = azurestack_resource_group.rg.name
  virtual_network_name = azurestack_virtual_network.vnet.name
  address_prefix   = "10.0.10.0/24"
}

# 📌 Subnet Privé (Base de Données)
resource "azurestack_subnet" "subnet_private" {
  name                 = "subnet-private"
  resource_group_name  = azurestack_resource_group.rg.name
  virtual_network_name = azurestack_virtual_network.vnet.name
  address_prefix   = "10.0.20.0/24"

}
