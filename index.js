const express = require('express');
const app = express();
require('dotenv').config(); // <-- Aqui!

const router = require('./routers/index.js');
const cors = require('cors');

app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);

router(app, express);

const PORT = 3001;

app.listen(PORT, (error) => {
  if (error) {
    console.log('Error running server');
    return;
  }

  console.log(`Server is running on port ${PORT}`);
});
