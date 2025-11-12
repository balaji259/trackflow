import express from "express";
import cors from "cors";
import { connectDB } from "./db/connection.js";
import { env } from "./config/env.js";
import organizationRoute from "./routes/organizationRoute.js";
import projectRoutes from "./routes/projectRoutes.js";

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/organizations", organizationRoute);
app.use("/api/projects", projectRoutes);

connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${env.PORT}`);
  });
});
