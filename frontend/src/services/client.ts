import { createPromiseClient } from "@bufbuild/connect";
import { createConnectTransport } from "@bufbuild/connect-web";

// Import service definition that you want to connect to.
import { ElizaService } from "../../gen/eliza_connect";

// The transport defines what type of endpoint we're hitting.
// In our example we'll be communicating with a Connect endpoint.
// If your endpoint only supports gRPC-web, make sure to use
// `createGrpcWebTransport` instead.
const transport = createConnectTransport({
  baseUrl: "http://localhost:3000",
});

// Here we make the client itself, combining the service
// definition with the transport.
export const connectWebClient = createPromiseClient(ElizaService, transport);