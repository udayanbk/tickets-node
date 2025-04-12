const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const logger = require('./middleware/logger');
const ticketRoutes = require('./routes/ticketRoutes');
const cookieParser = require('cookie-parser');
const authenticateToken = require('./middleware/user-auth');

const app = express();
const PORT = 5000;

// Middleware
// app.use(cors());

// app.use(cors({
//   origin: "http://localhost:3000", // Frontend origin
//   methods: "GET", // for SSE
//   credentials: true
// }));

app.use(cors({
  origin: 'http://localhost:3000',  // or your frontend domain
  credentials: true
}));
app.use(cookieParser())

// app.use(express.json())

app.get('/auth/check-token', authenticateToken, (req, res)=>res.json({status: true}))

app.use(bodyParser.json())

// Routes
console.log('----1')
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
