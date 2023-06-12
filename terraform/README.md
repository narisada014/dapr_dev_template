# Register python_app container

```
$ cd ..
$ cd python
$ docker build --platform=linux/amd64 -t template_python_app .
$ az acr login --name daprtemplateacr
$ docker tag template_python_app daprtemplateacr.azurecr.io/python_app:latest
$ docker push daprtemplateacr.azurecr.io/python_app:latest
```