import { createPromiseClient } from "@bufbuild/connect";
import { ElizaService } from "./gen/eliza_connect";
import { createConnectTransport } from "@bufbuild/connect-node";

const transport = createConnectTransport({
  baseUrl: "http://localhost:3000",
  httpVersion: "1.1",
});

async function main() {
  const client = createPromiseClient(ElizaService, transport);
  const res = await client.say({ sentence: "I feel happy." });
  console.log(res.sentence);
}
void main();
