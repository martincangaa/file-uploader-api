// generate-token.js
require('dotenv').config();        // loads JWT_SECRET=0000 from your .env
const jwt = require('jsonwebtoken');

const payload = {
  userId: 'martin',               // anything you want your server to know
  role: 'uploader'
};

const token = jwt.sign(
  payload,
  process.env.JWT_SECRET         // this must match the server’s secret
);

console.log(token);