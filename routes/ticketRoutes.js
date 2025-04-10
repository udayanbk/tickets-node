const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticateToken = require('../middleware/user-auth');

router.post('/new', ticketController.createTicket);

router.get('/:emp_id',  ticketController.getMyTickets);

router.post('/action', ticketController.actionTicket);

router.post('/history', ticketController.ticketHistory);

module.exports = router;
