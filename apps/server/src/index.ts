import http from 'node:http';
import path from 'node:path';

import { Server } from 'socket.io';
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import morgan from 'morgan';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
// import passport from 'passport';

dotenv.config();
import connectDB from './config/db';

const port = process.env.PORT || 8000;
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
connectDB().then(startServer);

// Express configuration
app.use(
  cookieSession({
    name: 'session',
    keys: ['asidiptaC'],
    maxAge: 24 * 60 * 60 * 100,
  })
);

// Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

// Set security headers
// app.use(helmet());

// Prevent http param pollution
app.use(hpp());

// Enable CORS for express app
app.use(cors());

// Express Server
app.get('/', (req: Request, res: Response) => {
  res.json({
    statusCode: 200,
    message: 'Server is running',
  });
});

// Test code for testing sockets
app.use(express.static(path.resolve('../public')));

app.get('/test', (req, res) => {
  return res.sendFile(path.resolve('./public/index.html'));
});

// Socket Server
io.on('connection', (socket) => {
  console.log(socket.id);
  socket.emit('connection:message', socket.id);
});

// Start the server
function startServer() {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
