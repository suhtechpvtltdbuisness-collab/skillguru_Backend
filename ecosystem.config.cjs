module.exports = {
  apps: [
    {
      name: "skillguru-backend",
      script: "./src/app.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        MONGO_URI: "mongodb+srv://Ankit:Ankit@cluster0.m609d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        JWT_SECRET: "supersecretkey_change_me",
        PORT: "5000",
        EMAIL_HOST: "smtp.hostinger.com",
        EMAIL_PORT: "465",
        EMAIL_USER: "no-reply@suhtech.in",
        EMAIL_PASS: "Ankit%45@123",
        FRONTEND_URL: "http://suhtech.in/",
        BACKEND_URL: "http://localhost:5000",

        // Cashfree Payment Gateway
        CASHFREE_APP_ID: "your_cashfree_app_id",
        CASHFREE_SECRET_KEY: "your_cashfree_secret_key",
        CASHFREE_BASE_URL: "https://sandbox.cashfree.com/pg"
      }
    }
  ]
};
