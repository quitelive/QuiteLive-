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

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  const fs = require("fs");
}

const Express = require("express");
const WebSocket = require("ws");
const chalk = require("chalk");

const api = require("./routes/api");
const messageActor = require("./src/messageActor");

const app = Express();

// Connect to MongoDB Server
const db = require("./src/mongodb");

// Connect to mongo database
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

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, _ => {
  console.log(
    chalk.white.bold("[Quite Live] Server running on port: " + chalk.red(`${PORT}`))
  );
  console.log(chalk.white.bold(`[Quite Live] Exit app with SIGTERM (^C)`));
});

// Add the public directory
app.use(Express.static("public"));

// Add API routes
app.use("/api", api);

// Streams

const wss = new WebSocket.Server({ server }, undefined);

const messages = new messageActor();

wss.on("connection", (ws, req) => {
  messages
    .addMessage("connect", {
      wsKey: req.headers["sec-websocket-key"],
      wsData: ws,
      clientTime: req.url
    })
    .catch(e => {
      throw e;
    });

  ws.on("message", data => {
    messages
      .addMessage(data, {
        key: req.headers["sec-websocket-key"]
      })
      .catch(e => {
        throw e;
      });
  });

  ws.on("close", client => {
    // TODO: Remove client from connectedClients
    messages.addMessage("leave", req.headers["sec-websocket-key"]).then(_ => {
      console.log("client left!");
    });
  });
});

// backend message dealer
messages.dispatchMessages();

app.get("/stream", (req, res) => {
  res.sendFile(__dirname + "/public/htmls/stream.html");
});

// Exit on SIGTERM - aka (^c)
process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
