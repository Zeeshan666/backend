const mongoose = require("mongoose");



const database = () => {
    return new Promise((res, rej) => {
        mongoose
            .connect(process.env.MONGO_URI)
            .then(() => {
                console.log("connected to database");
                res()
            })
            .catch((err) => {
                rej()
                console.log(err);
            });
    })
}


module.exports = database
