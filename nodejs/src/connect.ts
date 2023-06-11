import { ConnectRouter } from "@bufbuild/connect";
import { ElizaService } from "../gen/eliza_connect";
import type { SayRequest } from "../gen/eliza_pb.js";
export default (router: ConnectRouter) =>
  // registers buf.connect.demo.eliza.v1.ElizaService
  router.service(ElizaService, {
    // implements rpc Say
    async say(req: SayRequest) {
      console.log(req)
      console.log("Requested: ", req.sentence);
      return {
        sentence: `You said: ${req.sentence}`,
      };
    },
  });
