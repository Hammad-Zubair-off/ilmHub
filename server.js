const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorHandler');
const logger = require('./config/logger');
const swaggerDocument = YAML.load('./swagger.yaml');

// Load .env file from root directory
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Security middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true }));

const dbConfig = require("./config/dbConfig");

const usersRoute = require("./routes/usersRoute");
const examsRoute = require("./routes/examsRoute");
const resportsRoute = require("./routes/reportsRoute");

app.use("/api/users", usersRoute);
app.use("/api/exams", examsRoute);
app.use("/api/reports", resportsRoute);

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

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
