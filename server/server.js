require('dotenv').config();

// Validate required environment secrets on startup
const requiredSecrets = ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
for (const secret of requiredSecrets) {
  if (!process.env[secret]) {
    console.error(`❌ CRITICAL CONFIG ERROR: Missing required environment variable: ${secret}`);
    process.exit(1);
  }
}

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// DB and Socket config
const connectDB = require('./config/db');
const { initializeSocket } = require('./config/socket');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const characterRoutes = require('./routes/characterRoutes');
const gameRoutes = require('./routes/gameRoutes');
const chatRoutes = require('./routes/chatRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const provinceRoutes = require('./routes/provinceRoutes');
const clubRoutes = require('./routes/clubRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const festivalRoutes = require('./routes/festivalRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const familyRoutes = require('./routes/familyRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const locationRoutes = require('./routes/locationRoutes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Socket.IO initialization
const { io } = initializeSocket(server);
app.set('io', io); // make io accessible in controllers if needed

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

// CORS configuration
const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: clientURL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

// Logging and compression
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use(compression());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiting
app.use('/api/', apiLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/festivals', festivalRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/location', locationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date() });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
