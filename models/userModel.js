const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken')

const Schema = mongoose.Schema;

const usersSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Active'],
    default: 'Pending'
  }, confirmationCode: {
    type: String,
    unique: true
  }
}, { timestamps: true });


//Each Schema can define instance and static methods for its model.
//static method you can used 'this' for query model Model methods return instances of Query which allow us to further utilize its expressive capabilities.
//Statics are pretty much the same as methods but allow for defining functions that exist directly on your Model.
const createToken = (email) => {
  return JWT.sign({ email }, process.env.SECRET, { expiresIn: '2d' })
}

usersSchema.statics.signup = async function (req, res) {
  const { email, password } = req.body;
  const exists = await this.findOne({ email })
  if (exists) {
    throw Error('Email already in use')
  }

  //first geneatre salt then create hash
  //creating hash with 10rounds which takes time 4ms 
  const genrateSalt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, genrateSalt);
  const token = createToken(email);
  const user = await this.create({ email, password: hash, status: 'Pending', confirmationCode: token })
  return user;

};

usersSchema.statics.login = async function (req, res) {
  const { email, password } = req.body;
  const user = await this.findOne({ email })
  if (!user) {
    throw Error('User not exist in our system')
  }
  if (user.status != "Active") {
    throw Error('Pending Account. Please Verify Your Email!')
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error('Password is invalid')
  }
  return user;
}
module.exports = mongoose.model("users", usersSchema);
