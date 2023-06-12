import type { ServiceType } from "@bufbuild/protobuf"
import { PromiseClient } from "@bufbuild/connect"
import { BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { client as connectClient } from "./client";
import { createApi } from "@reduxjs/toolkit/query/react";
import {ElizaService} from "../../gen/eliza_connect";
import { SayRequest, SayResponse } from "../../gen/eliza_pb";

export const connectGrpcBaseQuery = <T extends ServiceType>(service: T): BaseQueryFn<
  { service: T; req: (client: PromiseClient<T>) => Promise<unknown> },
  unknown,
  unknown
> => async ({ service, req }, api, extraOptions) => {
    const client = connectClient(service);
    try {
      const response = await req(client);
      return { data: response };
    } catch (error) {
      return { error: { message: "error raised" } };
    }
  }

export const elizaApi = createApi({
  reducerPath: "elizaApi",
  baseQuery: connectGrpcBaseQuery(ElizaService),
  endpoints: (builder) => ({
    helloEliza: builder.query<string, string>({
      query: (sentence) => ({
        service: ElizaService,
        req: async (client: PromiseClient<typeof ElizaService>) => {
          const req = new SayRequest();
          req.sentence = sentence
          const res = await client.say(req)
          return res
        },
      }),
      transformResponse: (response: SayResponse) => {
        // シリアライズ可能なデータに変換する必要がある
        return response.sentence
      }
    }),
  }),
})

export const { useHelloElizaQuery } = elizaApi