# This directory is IaC

use Pulumi

create by this command

```
$ pulumi new azure-typescript
$ pulumi stack init dev
pulumi config set azure-native:location japaneast
$ pulumi stack select dev
$ pulumi up --yes
```

# Register python_app container

First, pulumi up command. next, register container to Azure Container Registry.

```
$ cd ..
$ docker build -t template_python_app .
$ az acr login --name acrDaprTemplate
$ docker tag template_python_app acrdaprtemplate.azurecr.io/python_app:latest
$ docker push acrdaprtemplate.azurecr.io/python_app:latest
```
