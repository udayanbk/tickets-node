// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  console.log('auth - start')
  console.log("req.cookies--------", req.cookies)
  const token  = req?.cookies?.auth_token;
  console.log("token", token);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    console.log("token", token);
    next();
  });
};

module.exports = authenticateToken;
