const workoutRoutes = require("./workouts");
const userRoutes = require('./user');

function SetupRoutes(app) {
    app.use("/api/workouts", workoutRoutes);
    app.use("/api/users", userRoutes);
}


module.exports = SetupRoutes