import http from 'node:http';

import { Server } from 'socket.io';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import passport from 'passport';

dotenv.config();
import connectDB from './config/db';

const app = express();
const server = http.createServer(app);
// Initializing socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  },
});

// Connect to DB
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is undefined');
  process.exit(1);
}
connectDB();

// Express configuration
app.use(
  cookieSession({
    name: 'session',
    keys: ['asidiptaC'],
    maxAge: 24 * 60 * 60 * 100,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent http param pollution
app.use(hpp());

// Enable CORS for express app
app.use(cors());

// Start the server
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
