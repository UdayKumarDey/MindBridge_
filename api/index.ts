import { createMindBridgeApp } from "../server/createApp";
import type { Request, Response } from "express";

const app = createMindBridgeApp();

const handler = (req: Request, res: Response) => {
const response = app(req, res);
return response;
};

export default handler;
