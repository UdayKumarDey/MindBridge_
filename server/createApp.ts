import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { createContext } from "./_core/context";
import { appRouter } from "./routers";

/**
 * Creates the API-only portion of MindBridge. Keeping this separate from the
 * local server entrypoint lets Vercel invoke the identical OAuth and tRPC stack
 * as a serverless function.
 */
export function createMindBridgeApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext })
  );
  return app;
}
