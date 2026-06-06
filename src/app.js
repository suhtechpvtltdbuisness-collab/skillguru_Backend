import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "express-async-errors";
import helmet from "helmet";
import morgan from "morgan";

import connectDB from "./config/db.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import routes from "./routes/index.js";

dotenv.config();

const app = express();

app.use(helmet());
const normalizeOrigin = (origin) => origin?.replace(/\/$/, "");

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      "https://suhtech.in",
      "https://www.suhtech.in",
      "http://suhtech.in",
      "http://www.suhtech.in",
      "http://localhost:8080",
      "https://skillguru-admin-suite.vercel.app",
      "https://skillguru-admin-suite-981d.vercel.app",
      "http://localhost:5173",
    ]
      .filter(Boolean)
      .map(normalizeOrigin);

    if (!origin || allowed.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    console.log(`CORS blocked request from: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
}));

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get("/", (req, res) => res.send("SkillGuru API"));

app.use("/api/v1", routes);
app.use("/api", routes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

export default app;
