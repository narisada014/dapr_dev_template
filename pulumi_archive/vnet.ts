import * as azure from "@pulumi/azure-native";
import {resourceGroup} from "./resourceGroup";

export const virtualNetwork = new azure.network.VirtualNetwork("sampleDaprVNet", {
    addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
    },
    subnets: [{
        // this setting refer to this error: 
        // Code="ManagedEnvironmentInvalidNetworkConfiguration" 
        // Message="The environment network configuration is invalid: Provided subnet must have a size of at least /23"
        // これは、Azure Container Appsの制約で、サブネットのサイズは/23以上である必要があることを示している
        addressPrefix: "10.0.0.0/23",
        name: "sample-dapr-subnet-1",
    }],
    location: "japaneast",
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: "sample-dapr-vnet",
});