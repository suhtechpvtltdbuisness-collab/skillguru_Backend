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
connectDB();

const app = express();



app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      "https://suhtech.in",
      "https://www.suhtech.in",
      "http://localhost:8080",
      "https://skillguru-admin-suite.vercel.app",
      "https://skillguru-admin-suite-981d.vercel.app"
    ].filter(Boolean);

    if (!origin || allowed.includes(origin)) {
      return callback(null, true);
    } else {
      console.log(`CORS blocked request from: ${origin}`); // <-- log it
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());




app.get("/", (req, res) => res.send("SkillGuru API"));

app.use("/api/v1", routes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
