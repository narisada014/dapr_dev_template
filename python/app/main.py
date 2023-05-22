from fastapi import FastAPI, Request
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
@app.post("/enqueue_message")
async def enqueue(message: Message):
    print(message)
    try:
        content = message.content
        message = {
            "message": content,
            "type": "simple_message"
        }
        dapr_client.invoke_binding(binding_name='queueStoragePubSub', operation='create', data=json.dumps({"content": message}))
        return message
    except Exception as e:
        raise e

"""
pydanticを使用すると、キューがdaprによって取得された際にバリデーションがかけられてしまう。具体的には以下の挙動が起こり健全ではない
- queue1
- queue2
二つのキューが存在する場合に、バインディングを使用したエンドポイントを用意するとqueue1にエンキューされた時にqueue2のバインディングもdaprに呼び出される仕組みのようである。
キューはバインディングしたAPIで処理されているので問題ないが、空のリクエストがもう片方のqueue2のバインディングに行われ、422が発生していた。
"""
@app.post("/queueStoragePubSub")
async def dequeue(request: Request):
    print("get queue message")
    request_body: Message = await request.json()
    content = request_body.get("content")
    if content is None or content.get("type") != "simple_message":
        print("type is not simple_message so return")
        return
    try:
        print(request_body)
    except Exception as e:
        raise e

"""
Azure blob Storageを使用した例
ファイルをアップロードし、それが完了するとqueueにファイル名の入った通知メッセージを送る
"""
@app.post("/upload")
async def upload():
    try:
        # ファイルをアップロードする
        file_name = "IMG_7413.jpeg"
        with open(file_name, "rb") as f:
            res = dapr_client.invoke_binding(binding_name='blob', operation='create', data=f.read())
            blobURL = res.json().get("blobURL")
            if blobURL is None:
                raise Exception("blobURL is None")
            message = {
                "message": blobURL,
                "type": "blob_url"
            }
            dapr_client.invoke_binding(binding_name='blobURLPubSub', operation='create', data=json.dumps({"content": message}))
    except Exception as e:
        raise e

@app.post("/blobURLPubSub")
async def blob_url_pubsub(request: Request):
    print("get blob queue message!!")
    request_body: Message = await request.json()
    content = request_body.get("content")
    if content is None or content.get("type") != "blob_url":
        print("type is not blob_url so return")
        return
    try:
        print(request_body)
    except Exception as e:
        raise e

