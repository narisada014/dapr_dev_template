from fastapi import FastAPI
from dapr.clients import DaprClient
from dapr.ext.fastapi import DaprApp
from pydantic import BaseModel
import json

app = FastAPI()
dapr_app = DaprApp(app)
dapr_client = DaprClient()

class Message(BaseModel):
    content: str

@app.get("/")
def read_root():
    return {"Hello": "World"}

"""
Azure Storage Queueを使用したPub/Sub
dequeueのメソッドをdaprと紐付けてやることでキューがenqueueされた時に呼び出される
"""
@app.post("/queueStoragePubSub")
async def dequeue(msg: Message):
    print("キューを取得します")
    try:
        print(msg)
    except Exception as e:
        raise e

@app.post("/enqueue_message")
async def enqueue(message: Message):
    print(message)
    try:
        content = message.content
        dapr_client.invoke_binding(binding_name='queueStoragePubSub', operation='create', data=json.dumps({"content": content}))
        return message
    except Exception as e:
        raise e

"""
Azure blob Storageを使用した例
ファイルがアップロードされると、blobStorageBindingのメソッドが呼び出される
WIP
"""

