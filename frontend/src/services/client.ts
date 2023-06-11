import { useMemo } from "react"
import { ServiceType } from "@bufbuild/protobuf"
import {
  createConnectTransport
} from "@bufbuild/connect-web"
import { PromiseClient, createPromiseClient } from "@bufbuild/connect"

const transport = createConnectTransport({
  baseUrl: "http://localhost:3000",
})

export const client = <T extends ServiceType>(service: T): PromiseClient<T> => {
  console.log('useCLient', service)
  return createPromiseClient(service, transport)
}