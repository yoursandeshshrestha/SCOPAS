import app from "./app.js";
import { db, connectDb } from "./config/database.js";
import { config } from "./config/env.js";

const PORT: number = config.server.port;

// DB connectivity (non-blocking)
(async () => {
  try {
    await connectDb();
    await db.$queryRaw`select 1`;
    console.log("✔️ Database connected Successfully");
  } catch (err) {
    console.error("⚠️ Database failed to connect:", err);
  }
})();

app.listen(PORT, () => {
  console.log(`🕸️ Server is running on port ${PORT}`);
  console.log(`🕷️ Health check: http://localhost:${PORT}/health`);
});
