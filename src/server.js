require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const routes                    = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

// ---- Security & utilities ----
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Health check ----
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'resume-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ---- API Routes ----
app.use('/api/v1', routes);

// ---- 404 + Error handlers ----
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Resume API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API base:     http://localhost:${PORT}/api/v1\n`);
});

module.exports = app;
