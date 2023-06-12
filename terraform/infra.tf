terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.43.0"
    }
    azapi = {
      source = "azure/azapi"
    }
  }
}

provider "azurerm" {
  features {}
}
provider "azapi" {
}

resource "azurerm_resource_group" "dapr_template" {
  name     = "rg-dapr-template"
  location = "japaneast"
}

resource "azurerm_virtual_network" "dapr_templatele_vnet" {
  name                = "sample-dapr-vnet"
  resource_group_name = azurerm_resource_group.dapr_template.name
  location            = azurerm_resource_group.dapr_template.location
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "dapr_template_snet" {
  name                 = "sample-dapr-subnet"
  resource_group_name  = azurerm_resource_group.dapr_template.name
  virtual_network_name = azurerm_virtual_network.dapr_templatele_vnet.name
  address_prefixes       = ["10.0.0.0/23"]
}

resource "azurerm_container_registry" "dapr_template_acr" {
  name                     = "daprtemplateacr"
  resource_group_name      = azurerm_resource_group.dapr_template.name
  location                 = azurerm_resource_group.dapr_template.location
  sku                      = "Basic"
  admin_enabled            = true
}

// log analytics
resource "azurerm_log_analytics_workspace" "container_apps" {
  name                = "dapr-template-log-analytics"
  location            = azurerm_resource_group.dapr_template.location
  resource_group_name = azurerm_resource_group.dapr_template.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

// Container Apps Enviroment
resource "azapi_resource" "container_app_environment" {
  type = "Microsoft.App/managedEnvironments@2022-11-01-preview"
  name = "dapr-template-env"
  location = azurerm_resource_group.dapr_template.location
  parent_id = azurerm_resource_group.dapr_template.id
  body = jsonencode({
    "properties": {
      "zoneRedundant": true,
      "vnetConfiguration": {
        "infrastructureSubnetId": azurerm_subnet.dapr_template_snet.id
      },
      "appLogsConfiguration": {
        "destination": "log-analytics",
        "logAnalyticsConfiguration": {
          "customerId": azurerm_log_analytics_workspace.container_apps.workspace_id,
          "sharedKey": azurerm_log_analytics_workspace.container_apps.primary_shared_key
        }
      }
    }
  })
}

resource "azurerm_container_app" "dapr_template_container_app" {
  name                         = "ca-dapr-template"
  container_app_environment_id = azapi_resource.container_app_environment.id
  resource_group_name          = azurerm_resource_group.dapr_template.name
  revision_mode                = "Single"

  registry {
    server               = azurerm_container_registry.dapr_template_acr.login_server
    password_secret_name = "sample-dapr-template-secret"
    username             = azurerm_container_registry.dapr_template_acr.admin_username
  }
  template {
    container {
      name   = "dapr-template-python"
      image  = join("/", [azurerm_container_registry.dapr_template_acr.login_server, "python_app:latest"])
      cpu    = "0.25"
      memory = "0.5Gi"
      env {
        name  = "PORT"
        value = "8000"
      }
      env {
        name  = "LOG_LEVEL"
        value = "INFO"
      }
    }
    min_replicas = 1
    max_replicas = 1
  }
  ingress {
    external_enabled = true
    target_port      = 8000
    traffic_weight { 
      percentage = 100
      latest_revision = true 
    }
  }
  secret {
    name  = "sample-dapr-template-secret"
    value = azurerm_container_registry.dapr_template_acr.admin_password
  }
}
