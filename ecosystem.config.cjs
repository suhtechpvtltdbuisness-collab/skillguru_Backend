require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "skillguru-backend",
      script: "./src/app.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: process.env.NODE_ENV || "production",
        MONGO_URI: process.env.MONGO_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        PORT: process.env.PORT || "5000",
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS,
        FRONTEND_URL: process.env.FRONTEND_URL,
        BACKEND_URL: process.env.BACKEND_URL,
        CASHFREE_APP_ID: process.env.CASHFREE_APP_ID,
        CASHFREE_SECRET_KEY: process.env.CASHFREE_SECRET_KEY,
        CASHFREE_BASE_URL: process.env.CASHFREE_BASE_URL,
      },
    },
  ],
};
