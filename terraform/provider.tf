terraform {
  required_providers {
    azurestack = {
      source  = "hashicorp/azurestack"
      version = "=1.0.0"
    }
  }
}

provider "azurestack" {
  subscription_id = var.subscription_id
  tenant_id = var.tenant_id
  client_id = var.client_id
  client_secret = var.client_secret
  metadata_host   = "https://management.dc2.xpressazure.com"
  features{}
}

resource "azurestack_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}