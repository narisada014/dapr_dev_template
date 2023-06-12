import { PromiseClient } from "@bufbuild/connect"
import { createApi } from "@reduxjs/toolkit/query/react";
import { ElizaService } from "../../gen/eliza_connect";
import { SayRequest, SayResponse } from "../../gen/eliza_pb";
import { connectGrpcBaseQuery } from "./connectGrpcBaseQuery";

export const elizaApi = createApi({
  reducerPath: "elizaApi",
  baseQuery: connectGrpcBaseQuery(ElizaService),
  endpoints: (builder) => ({
    helloEliza: builder.query<string, string>({
      query: (sentence) => ({
        req: async (client: PromiseClient<typeof ElizaService>) => client.say(new SayRequest({sentence: sentence})),
      }),
      transformResponse: (response: SayResponse) => {
        // シリアライズ可能なデータに変換する必要がある
        return response.sentence
      }
    }),
  }),
})

export const { useHelloElizaQuery } = elizaApi