const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.post('/new', ticketController.createTicket);

router.get('/:emp_id', ticketController.getMyTickets);

router.post('/approve', ticketController.approveTicket);

router.post('/reject', ticketController.rejectTicket);

module.exports = router;
