const UsersModel = require("../models/usersModel");
const TicketsModel = require("../models/ticketsModel");
const usersModel = require("../models/usersModel");
const TicketLogModel = require("../models/ticketLogModel");
const { sendEventToAll } = require('./sseController');
const { body, validationResult, check } = require('express-validator');

exports.createTicket = [
  check("title")
  .not()
  .isEmpty()
  .withMessage("title is required")
  .isLength({ min: 10 })
  .withMessage("title of min 10 characters"),

  check("description")
  .not()
  .isEmpty()
  .withMessage("description is required")
  .isLength({ min: 10 })
  .withMessage("description of min 10 characters"),

  check("category")
  .not()
  .isEmpty()
  .withMessage("category is required")
  .isNumeric()
  .withMessage("category should be numeric"),

  check("priority")
  .not()
  .isEmpty()
  .withMessage("priority is required")
  .isNumeric()
  .withMessage("priority should be numeric"),

async (req, res) => {
  try {
    console.log('createTicket, body-----', req.body)
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors = Object.values(errors.mapped())
      return res.status(400).json({ error: errors[0] });
    }
    const { title, description, category, priority } = req.body;

    const user = req.user;
    let newTicket = await TicketsModel.forge({
      emp_id: user.emp_id,
      title,
      description,
      category,
      priority,
      generated_by: user.emp_id,
    }).save();
    newTicket = newTicket.toJSON();
    console.log("newTicket----1", newTicket);

    await new TicketLogModel({
      ticket_id: newTicket.id,
      created_by: user.emp_id,
      priority,
      updated_by: user.emp_id,
      status: "New",
    }).save();

    res
      .status(201)
      .json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}];

exports.getMyTickets = async (req, res, next) => {
  try {
    const user = req.user;
    let query = TicketsModel.forge();

    query = query.where("priority", "in", [user.role_id, 1])

    query = query.where("status","in", ["Pending", "New"])

    let resTickets = await query.fetchPage({
      pageSize: 2,
      page: req?.params?.pageNo || 1,
    })

    if(!resTickets){
      return res.status(400).json({ error: "No Tickets found" });
    }

    response = resTickets.toJSON()
    const data = {
      tickets: response,
      pagination: resTickets.pagination
    }

    return res.status(200).json({
      message: "Tickets fetched successfullyyy",
      data
    });

  } catch (error) {
    console.error("Error fetching tickets:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.actionTicket = async (req, res) => {
  console.log("actionTicket---------------", req.body);
  try {
    const user = req.user;
    console.log("user", user);

    const actionType = req?.body?.actionType;
    const userPriority = user.role_id;

    let ticketExists = await TicketsModel.forge()
      .where("id", req?.body?.ticketId)
      .where("priority", userPriority)
      .fetch({ require: false });

    if (!ticketExists) {
      return res.status(400).json({ error: "Invalid Ticket details" });
    }
    ticketExists = await ticketExists.toJSON();

    let priority = ticketExists.priority;
    const comment = req?.body?.comment;
    if (actionType === "force_reject") {
      await TicketsModel.query()
        .where("id", req?.body?.ticketId)
        .where("priority", userPriority)
        .update({
          priority,
          updated_by: user.emp_id,
          status: "Force Rejected",
        });

      await new TicketLogModel({
        ticket_id: ticketExists.id,
        created_by: ticketExists.generated_by,
        updated_by: user.emp_id,
        comment,
        priority,
        status: "Force Rejected",
      }).save();

      sendEventToAll({ type: 'ticket - force rejected', ticket: [] });

      return res.status(200).json({
        message: "Ticket rejected successfully",
      });
    } else if (actionType === "force_approve") {
      await TicketsModel.query()
        .where("id", req?.body?.ticketId)
        .where("priority", userPriority)
        .update({
          priority,
          updated_by: user.emp_id,
          status: "Force Approved",
        });

      await new TicketLogModel({
        ticket_id: ticketExists.id,
        created_by: ticketExists.generated_by,
        updated_by: user.emp_id,
        comment,
        priority,
        status: "Force Approved",
      }).save();

      sendEventToAll({ type: 'ticket - force approved', ticket: [] });

      return res.status(200).json({
        message: "Ticket approved successfully",
      });
    } else {
      if (actionType === "reject") {
        if (priority === 1) {
          priority = 2;
        } else if (priority === 2) {
          priority = 3;
        } else if (priority === 3) {
          priority = 4;
        } else if (priority === 4) {
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

          sendEventToAll({ type: 'ticket - rejected', ticket: [] });

          return res.status(200).json({
            message: "Tickets updated successfully",
          });
        }
      } else if (actionType == "approve") {
        if (priority === 4) {
          priority = 3;
        } else if (priority === 3) {
          priority = 2;
        } else if (priority === 2) {
          priority = 1;
        } else if (priority === 1) {
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

          sendEventToAll({ type: 'ticket - approved', ticket: [] });

          return res.status(200).json({
            message: "Tickets updated successfully",
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
        });

      await new TicketLogModel({
        ticket_id: ticketExists.id,
        created_by: ticketExists.generated_by,
        updated_by: user.emp_id,
        comment,
        priority,
        status: "Pending",
      }).save();

      sendEventToAll({ type: 'ticket - updated', ticket: [] });

      return res.status(200).json({
        message: "Tickets updated successfully",
      });
    }
  } catch (error) {
    console.error("Error Action tickets:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.ticketHistory = async (req, res, next) => {
  try {
    console.log("start------1")
    const pageNo = req?.params?.pageNo;
    let emp_id = req?.user?.emp_id;
    let query = TicketLogModel.forge();

    query = query.where("created_by", emp_id);
    console.log("start------2")

    let tickets = await query.fetchPage({
      pageSize: 2,
      page: pageNo || 1,
      withRelated: ["tick"],
      require: false,
    })
    console.log("start------3", tickets)

    // let tickets = await TicketLogModel.forge()
    //   .where("created_by", emp_id)
    //   .fetchAll({
    //     require: false,
    //     withRelated: ["tick"],
    //   });

    if (!tickets || tickets.length === 0) {
      return res.status(400).json({ error: "No data found" });
    }
    console.log("start------4")
    const data = {
      pagination: tickets.pagination
    }

    tickets = tickets.toJSON();
    console.log("tickets", tickets)
    const ticketIds = [...new Set(tickets.map((log) => log.ticket_id))];

    const ticketDetails = await TicketsModel.query((qb) => {
      qb.whereIn("id", ticketIds);
    }).fetchAll({ require: false });

    const ticketMap = {};
    ticketDetails.toJSON().forEach((ticket) => {
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
          title: ticketMap[id]?.title || "",
          description: ticketMap[id]?.description || "",
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
    data.tickets = result

    return res.status(200).json({
      message: "Tickets history",
      data,
    });
  } catch (error) {
    console.error("Error Approving tickets:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const barGraphData = (resp) => {
  console.log('resp--->>', resp);
  let labels = ["NEW", "PENDING", "REJECTED", "APPROVED", "FORCE APPROVED", "FORCE REJECTED"];
  let dataValues = new Array(labels.length).fill(0);
  resp.map(i=>{
    const index = labels.indexOf(i?.status?.toUpperCase());
    dataValues[index]++;
  })
  let data = {
    labels: labels,
    datasets: [
      {
        label: 'Tickets Status',
        data: dataValues,
        backgroundColor: 'lightblue',
      }
    ]
  };
  return data;
}

exports.getAllTickets = async (req, res, next) => {
  try {
    let resp = await TicketsModel.forge().fetchAll({ require: false });
    resp = resp.toJSON();
    if (resp?.length > 0) {
      const barData = barGraphData(resp);

      return res.status(200).json({
        message: "Tickets Fetched",
        data: barData,
      });
    } else {
      return res.status(400).json({ error: "No data found" });
    }
  } catch (error) {
    console.error("Error Approving tickets:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
