import { createMindBridgeApp } from "../server/createApp";

// Vercel detects this default Express export and serves it as a Node.js Function.
const app = createMindBridgeApp();

export default app;
