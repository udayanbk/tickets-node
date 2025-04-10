const UsersModel = require('../models/usersModel');
const TicketsModel = require('../models/ticketsModel');
const usersModel = require('../models/usersModel');
const TicketLogModel = require('../models/ticketLogModel');

exports.createTicket = async (req, res) => {
  console.log('-----------1')
  try {
    if(!req?.body?.emp_id && !req?.body?.title){
      return res.status(404).json({
        error: 'Ticket details missing'
      });
    }
    console.log('-----------2')

    const { empId, title, description, category, priority } = req.body;
  console.log('-----------3', req.body)
    let user = await UsersModel.where({ emp_id: empId }).fetch({ require: false });
    if (!user) {
      return res.status(404).json({
        error: 'Employee ID not found in users table'
      });
    }
    user = user.toJSON();
    let newTicket = await TicketsModel.forge({
      emp_id: empId,
      title,
      description,
      category,
      priority,
      generated_by: user.emp_id
    }).save();
    newTicket = newTicket.toJSON();
    console.log('newTicket----1', newTicket)

    await new TicketLogModel({
      ticket_id: newTicket.id,
      created_by: empId,
      priority,
      updated_by: empId,
      status: "Pending",
    }).save();

    res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error creating ticket:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getMyTickets = async (req, res, next) => {
  try {
    console.log('emp_id---------------------------')
    const emp_id = req?.params?.emp_id;
    console.log('emp_id---------------------------', emp_id)
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
    console.log('user---------------------------', user)

    const tickets = await TicketsModel
    // .where({ emp_id })
    .where({ priority:  user.role_id})
    .where("status", "!=", "Force Rejected")
    .where("status", "!=", "Force Approved")
    .fetchAll();

    return res.status(200).json({
      message: 'Tickets fetched successfullyyy',
      data: tickets.toJSON()
    });
  } catch (error) {
    console.error('Error fetching tickets:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// exports.approveTicket = async (req, res) => {
//   console.log('approveTicket---------------', req.body)
//   try{
//     let user = await usersModel.forge()
//     .where("emp_id", req?.body?.empId)
//     .fetch({ require: false });

//     if(!user){
//       return res.status(400).json({ error: 'Invalid User' });
//     }

//     user = user.toJSON();
//     console.log('user', user);

//     const userPriority = user.role_id;

//     let ticketExists = await TicketsModel.forge()
//     .where("id", req?.body?.ticketId)
//     .where("priority", userPriority)
//     .fetch({ require: false });
    
//     if(!ticketExists){
//       return res.status(400).json({ error: 'Invalid Ticket details' });
//     }
//     ticketExists = await ticketExists.toJSON()

//     let priority = ticketExists.priority;
//     if(priority === 4) {
//       priority = 3
//     }
//     else if(priority === 3) {
//       priority = 2
//     }
//     else if(priority === 2) {
//       priority = 1
//     }
//     else {
//       return res.status(400).json({ error: 'Invalid Ticket Priority to Approve Ticket' });
//     }

//     await TicketsModel.query()
//     .where("id", req?.body?.ticketId)
//     .where("priority", userPriority)
//     .update({
//       priority,
//       updated_by: user.emp_id
//     })

//     res.status(200).json({
//       message: 'Tickets updated successfully'
//     });

//   } catch (error) {
//     console.error('Error Approving tickets:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

exports.actionTicket = async (req, res) => {
  console.log('actionTicket---------------', req.body);
  try {
    let user = await usersModel.forge()
    .where("emp_id", req?.body?.empId)
    .fetch({ require: false });

    if(!user){
      return res.status(400).json({ error: 'Invalid User' });
    }

    user = user.toJSON();
    console.log('user', user);

    const actionType = req?.body?.actionType;
    const userPriority = user.role_id;

    let ticketExists = await TicketsModel.forge()
    .where("id", req?.body?.ticketId)
    .where("priority", userPriority)
    .fetch({ require: false });
    
    if(!ticketExists){
      return res.status(400).json({ error: 'Invalid Ticket details' });
    }
    ticketExists = await ticketExists.toJSON()

    console.log('9999999999999',ticketExists);
    
    let priority = ticketExists.priority;
    const comment = req?.body?.comment;
    if(actionType === "force_reject"){
      await TicketsModel.query()
      .where("id", req?.body?.ticketId)
      .where("priority", userPriority)
      .update({
        priority,
        updated_by: user.emp_id,
        status: "Force Rejected",
      })

      await new TicketLogModel({
        ticket_id: ticketExists.id,
        created_by: ticketExists.generated_by,
        updated_by: user.emp_id,
        comment,
        priority,
        status: "Force Rejected",
      }).save();

      return res.status(200).json({
        message: 'Ticket rejected successfully'
      });
    }
    else if (actionType === "force_approve") {
      await TicketsModel.query()
      .where("id", req?.body?.ticketId)
      .where("priority", userPriority)
      .update({
        priority,
        updated_by: user.emp_id,
        status: "Force Approved",
      })

      await new TicketLogModel({
        ticket_id: ticketExists.id,
        created_by: ticketExists.generated_by,
        updated_by: user.emp_id,
        comment,
        priority,
        status: "Force Approved",
      }).save();

      return res.status(200).json({
        message: 'Ticket approved successfully'
      });
    }
    else {
      if (actionType === "reject") {
        if(priority === 1) {
          priority = 2
        }
        else if(priority === 2) {
          priority = 3
        }
        else if(priority === 3) {
          priority = 4
        }
        else if (priority === 4) {

          await TicketsModel.query()
          .where("id", req?.body?.ticketId)
          .where("priority", userPriority)
          .update({
            priority,
            updated_by: user.emp_id,
            status: "Rejected",
          });

          await new TicketLogModel({
            ticket_id: ticketExists.id,
            created_by: ticketExists.generated_by,
            updated_by: user.emp_id,
            comment,
            priority,
            status: "Rejected",
          }).save();

          return res.status(200).json({
            message: 'Tickets updated successfully'
          });

        }
      }
      else if (actionType == "approve") {
        if(priority === 4) {
          priority = 3
        }
        else if(priority === 3) {
          priority = 2
        }
        else if(priority === 2) {
          priority = 1
        }
        else if(priority === 1) {
          await TicketsModel.query()
          .where("id", req?.body?.ticketId)
          .where("priority", userPriority)
          .update({
            priority,
            updated_by: user.emp_id,
            status: "Approved",
          });

          await new TicketLogModel({
            ticket_id: ticketExists.id,
            created_by: ticketExists.generated_by,
            updated_by: user.emp_id,
            comment,
            priority,
            status: "Approved",
          }).save();

          return res.status(200).json({
            message: 'Tickets updated successfully'
          });
        }
      }
      //---------------------
      await TicketsModel.query()
      .where("id", req?.body?.ticketId)
      .where("priority", userPriority)
      .update({
        priority,
        updated_by: user.emp_id,
        status: "Pending",
      })

      await new TicketLogModel({
        ticket_id: ticketExists.id,
        created_by: ticketExists.generated_by,
        updated_by: user.emp_id,
        comment,
        priority,
        status: "Pending",
      }).save();

      return res.status(200).json({
        message: 'Tickets updated successfully'
      });
    }
   }catch (error) {
    console.error('Error Action tickets:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// exports.rejectTicket = async (req, res) => {
//   console.log('rejectTicket---------------', req.body)
  
//   try{
//     let user = await usersModel.forge()
//     .where("emp_id", req?.body?.empId)
//     .fetch({ require: false });

//     if(!user){
//       return res.status(400).json({ error: 'Invalid User' });
//     }

//     user = user.toJSON();
//     console.log('user', user);

//     const userPriority = user.role_id;

//     let ticketExists = await TicketsModel.forge()
//     .where("id", req?.body?.ticketId)
//     .where("priority", userPriority)
//     .fetch({ require: false });
    
//     if(!ticketExists){
//       return res.status(400).json({ error: 'Invalid Ticket details' });
//     }
//     ticketExists = await ticketExists.toJSON()

//     let priority = ticketExists.priority;
//     if(priority === 1) {
//       priority = 2
//     }
//     else if(priority === 2) {
//       priority = 3
//     }
//     else if(priority === 3) {
//       priority = 4
//     }
//     else {
//       return res.status(400).json({ error: 'Invalid Ticket Priority to Reject Ticket' });
//     }

//     await TicketsModel.query()
//     .where("id", req?.body?.ticketId)
//     .where("priority", userPriority)
//     .update({
//       priority,
//       updated_by: user.emp_id
//     })

//     res.status(200).json({
//       message: 'Tickets updated successfully'
//     });

//   } catch (error) {
//     console.error('Error Approving tickets:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }


exports.ticketHistory = async (req, res, next) => {
  try {
    console.log('req.body-----ticketHistory------', req.body);
    let tickets = await TicketLogModel.forge()
    .where("created_by", req?.body?.empId)
    .fetchAll({
      require: false,
      withRelated: ["tick"]
    });

    if(!tickets || tickets.length === 0){
      return res.status(400).json({ error: 'No data found' });
    }

    tickets = tickets.toJSON();
    console.log("my history tickets ---- ", tickets);


    // get unique ticket_ids
    const ticketIds = [...new Set(tickets.map(log => log.ticket_id))];

    // fetch all related ticket details
    const ticketDetails = await TicketsModel.query((qb) => {
      qb.whereIn('id', ticketIds);
    }).fetchAll({ require: false });

    const ticketMap = {};
    ticketDetails.toJSON().forEach(ticket => {
      ticketMap[ticket.id] = {
        title: ticket.title,
        description: ticket.description,
      };
    });

    const grouped = {};

    tickets.forEach((log) => {
      const id = log.ticket_id;

      if (!grouped[id]) {
        grouped[id] = {
          ticket_id: id,
          created_by: log.created_by,
          created_at: log.created_at,
          title: ticketMap[id]?.title || '',
          description: ticketMap[id]?.description || '',
          journey: [],
        };
      }

      grouped[id].journey.push({
        updated_by: log.updated_by,
        updated_at: log.updated_at,
        priority: log.priority,
        status: log.status,
        comment: log.comment,
      });
    });



    const result = Object.values(grouped);
    console.log("result------------hist-----", result)

    return res.status(200).json({
      message: 'Tickets history',
      data: result
    });

  } catch (error) {
    console.error('Error Approving tickets:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}