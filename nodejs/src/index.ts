import express, { Application, Request, Response } from "express";
import routes from "./connect";
import { expressConnectMiddleware } from "@bufbuild/connect-express";
import { cors as connectCors } from "@bufbuild/connect";
import cors from "cors";
import http from "http";

const app: Application = express();

// Options for configuring CORS. The @bufbuild/connect package exports
// convenience variables for configuring a CORS setup.
const corsOptions: cors.CorsOptions = {
  // Reflects the request origin. This should only be used for development.
  // Production should explicitly specify an origin
  origin: true,
  methods: [...connectCors.allowedMethods],
  allowedHeaders: [...connectCors.allowedHeaders],
  exposedHeaders: [...connectCors.exposedHeaders],
};

app.use(cors(corsOptions));
const PORT = 3000;

app.use(
  expressConnectMiddleware({
    routes,
  })
);

app.get("/", async (_req: Request, res: Response) => {
  return res.status(200).send({
    message: "Hello World!",
  });
});

try {
  // 0.0.0.0はコンテナ外部から（ブラウザなどから）アクセスできるようにするため
  http.createServer(app).listen(PORT, "0.0.0.0", () => {
    console.log(`dev server running at: http://localhost:${PORT}/`);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}
