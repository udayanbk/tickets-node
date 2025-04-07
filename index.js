const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const logger = require('./middleware/logger');
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
// app.use(express.json())
app.use(bodyParser.json())

// Routes
console.log('----1')
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
