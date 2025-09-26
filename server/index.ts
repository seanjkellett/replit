import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Export a function that can be called by Electron
export async function createServer(port?: number) {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite in development or serve static files in production
  const isElectron = process.env.ELECTRON_APP === 'true';
  const isDev = app.get("env") === "development";
  
  if (isDev && !isElectron) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const serverPort = port || parseInt(process.env.PORT || '5000', 10);
  
  return new Promise((resolve) => {
    // Bind to localhost only when running in Electron for security
    const host = isElectron ? "127.0.0.1" : "0.0.0.0";
    
    const httpServer = server.listen({
      port: serverPort,
      host,
      reusePort: !isElectron, // Don't reuse port in Electron
    }, () => {
      log(`serving on port ${serverPort} (${host})`);
      resolve(httpServer);
    });
  });
}

// Auto-start server when run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.includes('index.ts')) {
  (async () => {
    await createServer();
  })();
}
