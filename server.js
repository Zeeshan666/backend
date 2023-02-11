require("dotenv").config();

const express = require("express");
const database = require('./config')
var cors = require("cors");
const Routes = require("./routes/index");
const {logger} = require('./middlewears')
// express app
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

//  app.use(cors);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});


//logger middlewear//
app.use(logger);

// routes
Routes(app);

// connect to db
database().then(() => {
  return app.listen(process.env.PORT, () => {
    console.log("listening for requests on port", process.env.PORT);
  });
}).catch(err => { console.log(err); })
