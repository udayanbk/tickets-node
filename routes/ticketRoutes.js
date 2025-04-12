const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { eventsHandler } = require('../controllers/sseController');
const authenticateToken = require('../middleware/user-auth');

router.post('/new', authenticateToken, ticketController.createTicket);

router.get('/:pageNo',  authenticateToken, ticketController.getMyTickets);

router.post('/action', authenticateToken, ticketController.actionTicket);

router.get('/history/:pageNo', authenticateToken, ticketController.ticketHistory);

router.get('/admin/getAllTickets', authenticateToken, ticketController.getAllTickets);

router.get('/events', eventsHandler);

module.exports = router;
