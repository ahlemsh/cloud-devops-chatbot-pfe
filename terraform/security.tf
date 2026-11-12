# 📌 Création des Network Security Groups (NSG)
resource "azurestack_network_security_group" "nsg_aks1" {
  name                = "nsg-aks1"
  resource_group_name = azurestack_resource_group.rg.name
  location            = azurestack_resource_group.rg.location
}

resource "azurestack_network_security_group" "nsg_aks2" {
  name                = "nsg-aks2"
  resource_group_name = azurestack_resource_group.rg.name
  location            = azurestack_resource_group.rg.location
}

resource "azurestack_network_security_group" "nsg_gestion" {
  name                = "nsg-gestion"
  resource_group_name = azurestack_resource_group.rg.name
  location            = azurestack_resource_group.rg.location
}

resource "azurestack_network_security_group" "nsg_ia" {
  name                = "nsg-ia"
  resource_group_name = azurestack_resource_group.rg.name
  location            = azurestack_resource_group.rg.location
}

resource "azurestack_network_security_group" "nsg_data" {
  name                = "nsg-data"
  resource_group_name = azurestack_resource_group.rg.name
  location            = azurestack_resource_group.rg.location
}

resource "azurestack_network_security_group" "nsg_fortigate" {
  name                = "nsg-fortigate"
  resource_group_name = azurestack_resource_group.rg.name
  location            = azurestack_resource_group.rg.location
}

# 📌 Règles de Sécurité Optimisées

# 🔹 Autorisation SSH UNIQUEMENT depuis une IP spécifique
resource "azurestack_network_security_rule" "allow_ssh" {
  name                        = "allow-ssh"
  priority                    = 1001
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_address_prefix       = "192.168.1.100/32" # Modifier avec ton IP Admin
  destination_address_prefix  = "*"
  source_port_range           = "*"
  destination_port_range      = "22"
  network_security_group_name = azurestack_network_security_group.nsg_gestion.name
  resource_group_name         = azurestack_resource_group.rg.name
}

# 🔹 HTTP (port 80)
resource "azurestack_network_security_rule" "allow_http" {
  name                        = "allow-http"
  priority                    = 1002
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  source_port_range           = "*"
  destination_port_range      = "80"
  network_security_group_name = azurestack_network_security_group.nsg_fortigate.name
  resource_group_name         = azurestack_resource_group.rg.name
}

# 🔹 HTTPS (port 443)
resource "azurestack_network_security_rule" "allow_https" {
  name                        = "allow-https"
  priority                    = 1003
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  source_port_range           = "*"
  destination_port_range      = "443"
  network_security_group_name = azurestack_network_security_group.nsg_fortigate.name
  resource_group_name         = azurestack_resource_group.rg.name
}


# 🔹 Accès MongoDB uniquement depuis les applications internes
resource "azurestack_network_security_rule" "allow_mongodb" {
  name                        = "allow-mongodb"
  priority                    = 1004
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_address_prefix       = "10.0.0.0/16" # Seulement depuis le réseau interne
  destination_address_prefix  = "*"
  source_port_range           = "*"
  destination_port_range      = "27017"
  network_security_group_name = azurestack_network_security_group.nsg_data.name
  resource_group_name         = azurestack_resource_group.rg.name
}

# 🔹 Autorisation du trafic interne entre les VMs
resource "azurestack_network_security_rule" "allow_internal_traffic" {
  name                        = "allow-internal-traffic"
  priority                    = 1005
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "*"
  source_address_prefix       = "10.0.0.0/16"
  destination_address_prefix  = "10.0.0.0/16"
  source_port_range           = "*"
  destination_port_range      = "*"
  network_security_group_name = azurestack_network_security_group.nsg_gestion.name
  resource_group_name         = azurestack_resource_group.rg.name
}