const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
// const { limiter, securityHeaders } = require('./middlewares/securityMiddleware');
const swaggerDocument = YAML.load('./swagger.yaml');

// Load .env file from root directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Security middleware
// app.use(securityHeaders);
// app.use(limiter);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true }));

// Production logging middleware
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

const dbConfig = require("./config/dbConfig");

const usersRoute = require("./routes/usersRoute");
const examsRoute = require("./routes/examsRoute");
const resportsRoute = require("./routes/reportsRoute");

app.use("/api/users", usersRoute);
app.use("/api/exams", examsRoute);
app.use("/api/reports", resportsRoute);

app.get("/", (req, res) => {
  res.send("Quiz API is running");
});

// Only enable Swagger in development
if (process.env.NODE_ENV !== "production") {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

const port = process.env.PORT || 5001;

__dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client" , "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });   
} 

// Enhanced error handling
app.use((err, req, res, next) => {
  // Log error details
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🔒" : err.stack,
    path: req.path,
    method: req.method
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: "Validation Error",
      errors: process.env.NODE_ENV === "production" ? "Invalid input" : err.message,
      success: false
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: "Invalid token",
      success: false
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(409).json({
      message: "Duplicate entry",
      success: false
    });
  }

  // Generic error response
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" 
      ? "Something went wrong!" 
      : err.message,
    success: false
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server in production
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});
