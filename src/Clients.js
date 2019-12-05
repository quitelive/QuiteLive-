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

const util = require("util");
const FrameDecode = require("./helpers/decodeBase64");
const os = require("os");

const chalk = require("chalk");

class Clients {
  constructor(isVerbose = false) {
    this.clients = [];
    this.clientFrames = [];
    this.verbose = isVerbose;
    this.connectedCount = 0;
    this.connectedFrameCount = 0;
  }
  printClients() {
    let consoleOutput = chalk.red.bold("printClient(): ");
    this.clients.forEach(aClient => {
      consoleOutput =
        consoleOutput +
        chalk.white(
          "Excepted=" +
            aClient.excepted +
            ", Id: " +
            aClient.id +
            ", Time: " +
            util.inspect(aClient.time) +
            "\n               " // ugly way of formatting
        );
    });
    console.log(consoleOutput);
  }

  async addClient(secWebsocketKey, websocketData, date) {
    // assuming param is "date" as it looks for the 7th index in string
    // %22 is how ["] is transmitted
    const cleanedDate = date.substr(7).replace(/%22/g, '"');
    const d = JSON.parse(cleanedDate);

    const newClient = {
      id: secWebsocketKey,
      websocketData: websocketData,
      excepted: false, // flag for if client is excepted to start transmitting frames
      time: {
        day: d.day,
        hour: d.hour,
        minute: d.minute,
        second: d.second
      }
    };
    this.clients.push(newClient);
    this.clientFrames.push(newVideo(secWebsocketKey));
    this.connectedCount++;
    if (this.verbose) {
      console.log(
        chalk.red("New Client Added with key: ") + chalk.white(secWebsocketKey)
      );
    }
  }

  /**
   * accept a client to send frames
   * @param id
   * @returns {boolean} true if client is found
   */
  async acceptClient(id) {
    let found = false;
    this.clients.find(client => {
      if (client.id === id) {
        client.excepted = true;
        found = true;
      }
    });
    if (this.verbose) {
      console.log(chalk.red("Client with key excepted: ") + chalk.white(id));
    }
    return found;
  }

  getId(secWebsocketKey) {
    this.clients.forEach(clients => {
      if (clients.id === secWebsocketKey) {
        return clients.websocketData;
      }
    });
    return null;
  }

  getVideoStats() {
    console.log(chalk.blue("connected clients: ") + chalk.white(this.connectedCount));
    console.log(
      chalk.blue("how many frames we have: ") + chalk.white(this.connectedFrameCount)
    );

    // Logging memory
    console.log(
      chalk.blue("Memory remaining %: ") +
        chalk.white(
          Math.round((os.freemem() / 1024 / 1024 / (os.totalmem() / 1024 / 1024)) * 100) +
            "% with remaining mb: " +
            Math.round(os.freemem() / 1024 / 1024) +
            " Mb"
        )
    );
  }

  // takes in an array of objects (dictionaries)
  addFrames(data, id) {
    return new Promise((resolve, reject) => {
      const frames = new FrameDecode(data).decode64();
      let success = false;
      this.clientFrames.forEach(videoFrames => {
        if (videoFrames.id.localeCompare(id) === 0) {
          frames.forEach(frame => {
            if (this.verbose) {
              this.connectedFrameCount++;
            }
            videoFrames.frames.push(frame);
            success = true;
          });
          resolve("added frames to client");
        }
      });
      if (!success) reject(`failed to add frames to client with ID: ${id}`);
    });
  }

  removeClient(clientId) {
    let found = false;
    this.clients.forEach((aClient, i) => {
      // remove clientId from clients
      if (aClient.id === clientId) {
        this.connectedCount--;
        this.clients.splice(i, 1);
      }
    });

    this.clientFrames.forEach((aClient, i) => {
      // remove client from clientFrames
      if (aClient.id === clientId) {
        this.connectedFrameCount = aClient.frames.length - this.connectedFrameCount;
        this.clientFrames.splice(i, 1);
      }
    });
  }
}

const newVideo = secWebsocketKey => {
  return {
    id: secWebsocketKey,
    frames: []
  };
};

module.exports = Clients;
