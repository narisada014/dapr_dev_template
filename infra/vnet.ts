import * as azure from "@pulumi/azure-native";
import {resourceGroup} from "./resourceGroup";

export const virtualNetwork = new azure.network.VirtualNetwork("sampleDaprVNet", {
    addressSpace: {
        addressPrefixes: ["10.0.0.0/16"],
    },
    subnets: [{
        addressPrefix: "10.0.0.0/23",
        name: "sample-dapr-subnet-1",
    }],
    location: "japaneast",
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: "sample-dapr-vnet",
});