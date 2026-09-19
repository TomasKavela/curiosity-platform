import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AuthedVariables } from "./middleware/auth";
import { authMiddleware } from "./middleware/auth";
import { onboardingRoute } from "./routes/onboarding";
import { profileRoute } from "./routes/profile";
import { explorationsRoute } from "./routes/explorations";
import { ideasRoute } from "./routes/ideas";
import { memoriesRoute } from "./routes/memories";
import { notificationsRoute } from "./routes/notifications";

const app = new Hono<{ Bindings: Env; Variables: AuthedVariables }>();

app.use("*", cors({ credentials: true, origin: (origin) => origin ?? "*" }));

app.get("/api/health", (c) =>
  c.json({ status: "ok", environment: c.env.ENVIRONMENT ?? "unknown" })
);

app.use("/api/*", authMiddleware);

app.route("/api/onboarding", onboardingRoute);
app.route("/api/profile", profileRoute);
app.route("/api/explorations", explorationsRoute);
app.route("/api/ideas", ideasRoute);
app.route("/api/memories", memoriesRoute);
app.route("/api/notifications", notificationsRoute);

export default app;
