resource "azurestack_route_table" "aks_route_table" {
  name                          = "aks-route-table"
  location                      = azurestack_resource_group.rg.location
  resource_group_name           = azurestack_resource_group.rg.name
}

resource "azurestack_route" "aks_to_fortigate" {
  name                   = "aks-to-fortigate"
  resource_group_name    = azurestack_resource_group.rg.name
  route_table_name       = azurestack_route_table.aks_route_table.name
  address_prefix         = "0.0.0.0/0"
  next_hop_type          = "VirtualAppliance"
  next_hop_in_ip_address = azurestack_network_interface.nic_fortigate_private.private_ip_address
}

resource "azurestack_route_table" "db_route_table" {
  name                = "db-route-table"
  location            = azurestack_resource_group.rg.location
  resource_group_name = azurestack_resource_group.rg.name
}

resource "azurestack_route" "db_to_fortigate" {
  name                   = "db-to-fortigate"
  resource_group_name    = azurestack_resource_group.rg.name
  route_table_name       = azurestack_route_table.db_route_table.name
  address_prefix         = "0.0.0.0/0"
  next_hop_type          = "VirtualAppliance"
  next_hop_in_ip_address = azurestack_network_interface.nic_fortigate_private.private_ip_address
}

