const mongoose = require('mongoose');
require("dotenv").config();

async function dbConnect() { 
  try {
    await mongoose.connect(process.env.MONGO_STRING_CODE);
    console.log(' MongoDB connected');
  } catch (err) {
    console.error(' DB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = dbConnect;
