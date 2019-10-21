/*
 * Nova Trauben (C) 2019
 *
 * This file is part of QuiteLive.
 * https://www.github.com/1fabunicorn/QuiteLive-API
 *
 * QuiteLive is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * QuiteLive is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with QuiteLive.  If not, see <https://www.gnu.org/licenses/>.
 */

if (process.env.NODE_ENV !== "production") require("dotenv").config();
const util = require('util');
const Mongoose = require("mongoose");
const Express = require("express");
const WebSocket = require("ws");
const api = require("./routes/api");
const app = Express();
const Clients = require("./src/Clients");

// Connect to MongoDB Server
const db = require("./src/mongodb");

// Add the public directory
app.use(Express.static("public"));

// // Connect to mongo database
// Mongoose.connect(db.mongoURI, {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//     console.log(`MongoDB Connected -> ${db.mongoURI}`);
//   })
//   .catch(err => {
//     console.error(`Failed to connect to MongoDB Server -> ${db.mongoURI}`);
//     console.error(`Cause: ${err}`);
//   });

// Add API routes
app.use("/api", api);

// Streams

const wss = new WebSocket.Server({ port: 5001 });
const clients = new Clients();

wss.on("connection", (ws, req) => {
  // identify clients with
  console.log("new client");
  clients.addClient(req.headers["sec-websocket-key"], ws, req.url);

  ws.on("message", data => {
    clients.addFrames(data, req.headers["sec-websocket-key"]);
    console.log(util.inspect(clients.clientVideoFrames, {showHidden: false, depth: null}));
  });
});

// sendMessage = () => {
//   connected.forEach(client => {
//     client.send("hello new client");
//   });
// };

app.get("/stream", (req, res) => {
  res.sendFile(__dirname + "/public/htmls/stream.html");
});

const PORT = process.env.PORT || 5000;
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
