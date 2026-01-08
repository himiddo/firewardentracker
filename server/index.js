const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');

const app = express();

//middleware
app.use(cors());
app.use(express.json());

//import routes
const wardenRoutes = require('./routes/wardens');
const locationRoutes = require('./routes/locations');

//api routes
app.use('/api/wardens', wardenRoutes);
app.use('/api/locations', locationRoutes);

//serve static files from react app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

//initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Connected to Azure Cosmos DB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
}

startServer();
