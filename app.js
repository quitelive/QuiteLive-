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

// clear redis db at startup
const Redis = require("redis");

const client = Redis.createClient(process.env.REDIS_URL); // creates a new client

client.on("connect", function() {
  client.flushall("ASYNC", _ => {
    console.log(chalk.white.bold("[Quite Live] flushed redis"));
    client.quit();
  });
});

const api = require("./routes/api");
const messageActor = require("./src/messageActor");
// for sending seed back and forth
const ClassMessageSender = require("./src/interClassMessageSender");

const app = Express();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    chalk.white.bold("[Quite Live] Server running on port: " + chalk.red(`${PORT}`))
  );
  console.log(chalk.white.bold(`[Quite Live] Exit app with SIGTERM (^C)`));
});

// Exit on SIGTERM - aka (^c)

// Add the public directory
app.use(Express.static("public"));

// Add API routes
app.use("/api", api);

// Streams

const wss = new WebSocket.Server({ server }, undefined);

const messageSender = new ClassMessageSender();

const messages = new messageActor(messageSender);
messages.Clients.initWallet();

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
    if (messageSender.hasMessage()) {
      ws.send(messageSender.getMessage());
    }
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

process.on("SIGTERM", () => {
  console.log("here");
  server.close(() => {
    console.log("Process terminated");
  });
});

//TODO: clear redis on startup
