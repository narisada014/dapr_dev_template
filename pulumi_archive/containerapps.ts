import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { resourceGroup } from "./resourceGroup";
import { registry } from "./registry";
import { image, credentials } from "./dockerContainer";
import { virtualNetwork } from "./vnet";
import * as operationalinsights from "@pulumi/azure-native/operationalinsights";

// Create LogAnalytics
const workspace = new operationalinsights.Workspace("loganalytics", {
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "PerGB2018",
    },
    retentionInDays: 30,
});

// Share LogAnalytics keys to Container App
const workspaceSharedKeys = operationalinsights.getSharedKeysOutput({
    resourceGroupName: resourceGroup.name,
    workspaceName: workspace.name,
});

// Create an Azure Kubernetes Environment
const environment = new azure.app.ManagedEnvironment("environment", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    vnetConfiguration: {
        infrastructureSubnetId: pulumi.all([virtualNetwork.subnets]).apply(([subnets]) => subnets![0].id!),
    },
    // ゾーン冗長するにはinfrastructureSubnetIdが必須。
    // またコンテナが3つ以上あるとアベイラビリティゾーン内で3箇所のデータセンターに配置される
    // ref: https://learn.microsoft.com/en-us/azure/container-apps/disaster-recovery?tabs=azure-cli
    zoneRedundant: true, // Azure PortalのContainer Apps EnvironmentのJSONビューから設定ができているか確認可能
    appLogsConfiguration: {
        destination: "log-analytics",
        logAnalyticsConfiguration: {
            customerId: workspace.customerId,
            sharedKey: workspaceSharedKeys.apply((r: operationalinsights.GetSharedKeysResult) => r.primarySharedKey!),
        },
    },
});

// Create a Container App with a scheduled job
const containerApp = new azure.app.ContainerApp("sampleContainerApp", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    containerAppName: "sample-container-app", // - or _ allowed
    managedEnvironmentId: environment.id,
    template: {
        containers: [{
            image: image.imageName,
            name: "sample-python-container",
            env: [{
                name: "PORT",
                value: "8000",
            }],
            resources: {
                cpu: 0.25,
                memory: "0.5Gi",
            }
        }],
        scale: {
            maxReplicas: 1, // To achieve zone redundancy, a minimum of three zones must be configured.
            minReplicas: 1, // To achieve zone redundancy, a minimum of three zones must be configured.
            rules: [{
                custom: {
                    metadata: {
                        concurrentRequests: "50",
                    },
                    type: "http",
                },
                name: "httpscalingrule",
            }],
        },
    },
    configuration: {
        // dapr: {
        //     appPort: 8080,
        //     appProtocol: "http",
        //     enabled: true,
        // },
        ingress: {
            external: true,
            targetPort: 8000
        },
        activeRevisionsMode: "Single",
        registries: [{
            server: registry.loginServer,
            username: credentials.apply(c => c.username!),
            passwordSecretRef: "pwd",
        }],
        secrets: [{
            name: "pwd",
            value: credentials.apply(c => c.passwords![0].value!),
        }],
    },
});

export const containerAppsOutput = pulumi.interpolate`https://${containerApp.configuration.apply((c: any) => c?.ingress?.fqdn)}`;