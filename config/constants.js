const env = require('dotenv');
env.config();

const config = {

  JWT_SECRET: process.env.JWT_SECRET

}

module.exports = config;