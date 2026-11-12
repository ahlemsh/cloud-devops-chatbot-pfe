variable "location" {
  default = "dc2"
}

variable "resource_group_name" {
  default = "RG-ahlem.cherif"
}

variable "vm_size" {
  default = "Standard_D2s_v3"
}

variable "dns_prefix" {
  default     = "aks-cluster"
}

variable "fortigate_admin_password" {
  type        = string
  sensitive = true
  default = "Fortigate123!!"
}

variable "vm_admin_password" {
  type        = string
  sensitive   = true
  default = "Admin123!!"
}

variable "subscription_id" {
   type = string
  sensitive = true
}

variable "client_id" {
   type = string
  sensitive = true
}

variable "client_secret" {
   type = string
  sensitive = true
}

variable "tenant_id" {
  type = string
  sensitive = true
}