import * as containerregistry from "@pulumi/azure-native/containerregistry";
import * as pulumi from "@pulumi/pulumi";

// stack1の出力を参照
const resourceGroup = new pulumi.StackReference(
  "narisada014/dapr_template/resource_group"
);

const registry = new containerregistry.Registry("registry", {
  resourceGroupName: resourceGroup.getOutput("resourceGroupName"),
  registryName: "acrDaprTemplate",
  sku: {
    name: "Basic",
  },
  adminUserEnabled: true,
});

export const registryUrl = registry.loginServer;
