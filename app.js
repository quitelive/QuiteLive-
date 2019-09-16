if (process.env.NODE_ENV !== "production") require("dotenv").config();
const Mongoose = require("mongoose");
const Express = require("express");
const api = require("./routes/api");
const app = Express();

// Connect to MongoDB Server
const db = require("./src/mongodb");
Mongoose.connect(db.mongoURI, {
  useNewUrlParser: true
})
  .then(() => {
    console.log(`MongoDB Connected -> ${db.mongoURI}`);
  })
  .catch(err => {
    console.error(`Failed to connect to MongoDB Server -> ${db.mongoURI}`);
    console.error(`Cause: ${err}`);
  });

app.use("/api", api);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  console.log(`Exit app with SIGTERM (^C)`);
});

process.on("SIGTERM", () => {
  port.close(() => {
    console.log("Process terminated");
  });
});
