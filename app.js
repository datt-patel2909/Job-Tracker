require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const path = require('path');

// Security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const ratelimiter = require('express-rate-limit');

// Connect DB
const connectDB = require('./db/connect');
const authenticationUser = require('./middleware/authentication');

// Routers
const authrouter = require('./routes/auth');
const jobsrouter = require('./routes/jobs');

// Error handlers
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// Middleware
app.set('trust proxy', 1);
app.use(ratelimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));
app.use(express.json());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://accounts.google.com",
        "https://apis.google.com"
      ],

      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://accounts.google.com"
      ],

      imgSrc: [
        "'self'",
        "data:",
        "https://lh3.googleusercontent.com"
      ],

      frameSrc: [
        "'self'",
        "https://accounts.google.com"
      ],

      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://oauth2.googleapis.com"
      ],

      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ]
    }
  })
);
app.use(cors());
app.use(xss());

// API Routes
app.use('/api/v1/auth', authrouter);
app.use('/api/v1/jobs', authenticationUser, jobsrouter);

// Serve React frontend in production
app.use(express.static(path.resolve(__dirname, 'frontend', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
