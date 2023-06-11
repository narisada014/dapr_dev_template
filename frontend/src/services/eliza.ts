import { Message } from "@bufbuild/protobuf"
import type { PartialMessage, ServiceType, MethodInfo, MethodInfoUnary } from "@bufbuild/protobuf"
import { PromiseClient } from "@bufbuild/connect"
import { BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { client as connectClient } from "./client";
import { createApi } from "@reduxjs/toolkit/query/react";
import {ElizaService} from "../../gen/eliza_connect";
import { SayRequest, SayResponse } from "../../gen/eliza_pb";

type RequestType = Message;  // TODO: 適切なリクエスト型を考える
type ResponseType = Message;  // TODO: 適切なレスポンス型を考える

type Service = ServiceType & {
  methods: {
    [methodName: string]: MethodInfoUnary<RequestType, ResponseType>;
  }
}

async function callMyUnaryMethod(
  client: PromiseClient<Service>,
  methodName: string,
  request: PartialMessage<RequestType>,
): Promise<ResponseType> {
  // Check if the method name exists on the client.
  if (!(methodName in client)) {
    throw new Error(`Method ${methodName} does not exist on the client.`);
  }

  // Retrieve the method.
  const method = client[methodName as keyof Service["methods"]];
  if (typeof method !== 'function') {
    throw new Error(`Property ${methodName} on client is not a function.`);
  }

  // Call the method and return the resulting Promise.
  return method(request, {});
}

export const connectGrpcBaseQuery: BaseQueryFn<
  { service: ServiceType; method: string; req: PartialMessage<RequestType> },
  unknown,
  unknown
> = async ({ service, method, req }, api, extraOptions) => {
  const client = connectClient(service);
  try {
    const response = await callMyUnaryMethod(client, method, req); 
    return { data: response };
  } catch (error) {
    return { error: { message: "error raised" } };
  }
}

export const elizaApi = createApi({
    reducerPath: "elizaApi",
    baseQuery: connectGrpcBaseQuery,
    endpoints: (builder) => ({
        helloEliza: builder.query<{
          sentence: string
        }, {
          sentence: string
        }>({
          query: (message) => {
            const req = new SayRequest()
            req.sentence = message.sentence
            return ({
              service: ElizaService,
              method: "say",
              req: req,
            })
          },
          transformResponse: (response: SayResponse) => {
            console.log(response)
            return response
          }
        }),
      }),
})

export const { useHelloElizaQuery } = elizaApi