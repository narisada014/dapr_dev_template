import express, { Application, Request, Response } from "express";

const app: Application = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (_req: Request, res: Response) => {
  return res.status(200).send({
    message: "Hello World!",
  });
});

try {
  // 0.0.0.0はコンテナ外部から（ブラウザなどから）アクセスできるようにするため
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`dev server running at: http://localhost:${PORT}/`);
  });
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}
