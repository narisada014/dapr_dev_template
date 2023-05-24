import * as containerregistry from "@pulumi/azure-native/containerregistry";
import { resourceGroup } from "./resourceGroup";

export const registry = new containerregistry.Registry("registry", {
  resourceGroupName: resourceGroup.name,
  registryName: "acrDaprTemplate",
  sku: {
    name: "Basic",
  },
  adminUserEnabled: true,
});
