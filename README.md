# Template for developing microservices environment using Python and Node.js with Dapr

## !!WIP：This repository is under construction!!

### how to launch

```
$ docker-compose up
```

### Python development

```
$ cd python
$ code .
```

Perform "Attaching to a running container" and carry out development within the remote environment.

### Here are the things you need for local development with Azure Storage

- Azurite
- Azure Storage Explorer

### For local development with Azure Functions, you'll need the following

```
$ npm install -g azure-functions-core-tools@3 --unsafe-perm true
```

# TODO

- add Node.js dev environment
- add Azure Function Trigger on local
  - ref: https://medium.com/cloudfordummies/local-azure-storage-emulation-with-azurite-and-azure-functions-a-dummies-guide-53949f0c1f44
- add pubsub using Azure Service Bus
  - ref: https://jimmybogard.com/local-development-with-azure-service-bus/
- add Github Actions

### Watch

issue about using Elasticsearch through dapr

- https://github.com/dapr/components-contrib/issues/2826
