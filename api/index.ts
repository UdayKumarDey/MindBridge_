import { createMindBridgeApp } from "../server/createApp";
import type { Request, Response } from "express";

const app = createMindBridgeApp();

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
