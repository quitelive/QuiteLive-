if (process.env.NODE_ENV !== "production") require("dotenv").config();
const Mongoose = require("mongoose");
const Express = require("express");
const WebSocket = require("ws");
const api = require("./routes/api");
const app = Express();

// Connect to MongoDB Server
const db = require("./src/mongodb");

// Add the public directory
app.use(Express.static("public"));

// Connect to mongo database
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

// Add API routes
app.use("/api", api);

// Streams

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws, req) => {
  console.log("User connected");
  console.log(req.connection.remoteAddress);
  ws.on("message", message => {
    console.log(`Received message => ${message}`);
  });
    // console.log(wss.clients);
  ws.on("close", () => {
    console.log("disconnected")
  });
});

app.get("/stream", (req, res) => {
  res.sendFile(__dirname + "/public/htmls/stream.html");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
  console.log(`Exit app with SIGTERM (^C)`);
});

// Exit on SIGTERM - aka (^c)
process.on("SIGTERM", () => {
  port.close(() => {
    console.log("Process terminated");
  });
});
