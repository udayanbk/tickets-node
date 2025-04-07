const UsersModel = require('../models/usersModel');
const TicketsModel = require('../models/ticketsModel');

exports.createTicket = async (req, res) => {
  try {
    if(!req?.body?.emp_id && !req?.body?.title){
      return res.status(404).json({
        error: 'Ticket details missing'
      });
    }

    const { emp_id, title, description, category } = req.body;
    let user = await UsersModel.where({ emp_id }).fetch({ require: false });
    if (!user) {
      return res.status(404).json({
        error: 'Employee ID not found in users table'
      });
    }
    user = user.toJSON();
    const newTicket = await TicketsModel.forge({
      emp_id,
      title,
      description,
      category,
      priority: user.role_id
    }).save();

    res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error creating ticket:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getMyTickets = async (req, res) => {
  try {
    const emp_id = req?.params?.emp_id;

    if (!emp_id || isNaN(emp_id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }
    
    let user = await UsersModel.forge()
    .where("emp_id", emp_id)
    .fetch({ require: false });

    if(!user){
      return res.status(400).json({ error: 'Invalid User' });
    }
    user = user.toJSON();

    const tickets = await TicketsModel
    // .where({ emp_id })
    .where({ priority:  user.role_id})
    .fetchAll();

    res.status(200).json({
      message: 'Tickets fetched successfully',
      data: tickets.toJSON()
    });
  } catch (error) {
    console.error('Error fetching tickets:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.approveTicket = async (req, res) => {
  console.log('approveTicket---------------', req.body)
  try{
    let ticketExists = await TicketsModel.forge()
    .where("id", req?.body?.ticketId)
    .where("emp_id", req?.body?.empId)
    .fetch({ require: false });
    
    if(!ticketExists){
      return res.status(400).json({ error: 'Invalid Ticket details' });
    }
    ticketExists = await ticketExists.toJSON()

    let priority = ticketExists.priority;
    if(priority === 4) {
      priority = 3
    }
    else if(priority === 3) {
      priority = 2
    }
    else if(priority === 2) {
      priority = 1
    }
    else {
      return res.status(400).json({ error: 'Invalid Ticket Priority to Approve Ticket' });
    }

    await TicketsModel.query()
    .where("id", req.body.ticketId)
    .where("emp_id", req.body.empId)
    .update({
      priority
    })

    res.status(200).json({
      message: 'Tickets updated successfully'
    });

  } catch (error) {
    console.error('Error Approving tickets:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

exports.rejectTicket = async (req, res) => {
  console.log('rejectTicket---------------', req.body)
  try{
    let ticketExists = await TicketsModel.forge()
    .where("id", req?.body?.ticketId)
    .where("emp_id", req?.body?.empId)
    .fetch({ require: false });
    
    if(!ticketExists){
      return res.status(400).json({ error: 'Invalid Ticket details' });
    }
    ticketExists = await ticketExists.toJSON()

    let priority = ticketExists.priority;
    if(priority === 1) {
      priority = 2
    }
    else if(priority === 2) {
      priority = 3
    }
    else if(priority === 3) {
      priority = 4
    }
    else {
      return res.status(400).json({ error: 'Invalid Ticket Priority to Reject Ticket' });
    }

    await TicketsModel.query()
    .where("id", req.body.ticketId)
    .where("emp_id", req.body.empId)
    .update({
      priority
    })

    res.status(200).json({
      message: 'Tickets updated successfully'
    });

  } catch (error) {
    console.error('Error Approving tickets:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}