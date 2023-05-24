import * as resources from "@pulumi/azure-native/resources";

// Create an Azure Resource Group
export const resourceGroup = new resources.ResourceGroup("DaprTemplate", {
  resourceGroupName: "rg-dapr-template",
});
