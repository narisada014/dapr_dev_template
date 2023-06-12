import type { ServiceType } from "@bufbuild/protobuf"
import { PromiseClient } from "@bufbuild/connect"
import { BaseQueryFn } from "@reduxjs/toolkit/query/react"
import { client as connectClient } from "./client"

export const connectGrpcBaseQuery =
  <T extends ServiceType>(
    service: T,
  ): BaseQueryFn<
    { req: (client: PromiseClient<T>) => Promise<unknown> },
    unknown,
    unknown
  > =>
  async ({ req }, api, extraOptions) => {
    const client = connectClient(service)
    try {
      const response = await req(client)
      return { data: response }
    } catch (error) {
      return { error: { message: "error raised" } }
    }
  }
