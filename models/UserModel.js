
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  type: String // 'admin' or 'customer'
});


module.exports = mongoose.model('User', userSchema);

