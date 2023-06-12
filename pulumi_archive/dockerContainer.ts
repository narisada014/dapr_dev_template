import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import * as docker from "@pulumi/docker";
import {resourceGroup} from "./resourceGroup";
import {registry} from "./registry";

export const credentials = pulumi.all([resourceGroup.name, registry.name]).apply(([resourceGroupName, registryName]) => azure.containerregistry.listRegistryCredentials({
    resourceGroupName: resourceGroupName,
    registryName: registryName,
}));

export const image = new docker.Image("cronImage", {
    imageName: pulumi.interpolate`${registry.loginServer}/python_app:latest`,
    build: {
        context: "../python",
        platform: "linux/amd64" // Mac OSの環境ではarm64になるので、明示的に指定する
    },
    registry: {
        server: registry.loginServer,
        username: credentials.apply(c => c.username!),
        password: credentials.apply(c => c.passwords![0].value!)
    },
});