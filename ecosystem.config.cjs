module.exports = {
  apps: [
    {
      name: "skillguru-backend",
      script: "./src/app.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        MONGO_URI: "mongodb+srv://Ankit:Ankit@cluster0.m609d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
        JWT_SECRET: "supersecretkey_change_me",
        EMAIL_HOST: "smtp.hostinger.com",
        EMAIL_PORT: 465,
        EMAIL_USER: "no-reply@suhtech.in",
        EMAIL_PASS: "we5#Oy^6:Z5v",
        FRONTEND_URL: "https://suhtech.in/"
      }
    }
  ]
};
