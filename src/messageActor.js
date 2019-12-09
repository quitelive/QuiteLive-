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

const Bull = require("bull");
const Chalk = require("chalk");
const Hasha = require("hasha");
// const util = require("util");

const Queue = require("./Queue");
const parseMessage = require("./messageParser");
const clients = require("./Clients");

class messageActor {
  constructor() {
    this.messageQueue = new Bull("client messages", process.env.REDIS_URL);
    this.Clients = new clients(true);
  }

  dispatchMessages() {
    this.messageQueue.process(currentMessage => {
      if (this.Clients.verbose) {
        this.logger(5000);
      }
      const message = currentMessage.data["aMessage"];
      // remove clients that left
      if (message.type === "leave") {
        this.Clients.removeClient(message.data);
      }
      // connect new clients
      if (message.type === "connect") {
        this.Clients.addClient(
          message.data[1], // wsKey
          message.data[2], // wsData
          message.data[3] // clientTime
        )
          .then(_ => {
            this.Clients.printClients();
            currentMessage.remove();
          })
          .catch(e => {
            throw e;
          });
      }

      // if message is type video
      if (message.type === "video") {
        // console.log("here");
        // start
        if (message.request === "start") {
          // for now, we except every connection
          const clientID = message.key; // right now the field will be straight in data
          this.Clients.acceptClient(clientID);
        }

        // frame
        if (message.request === "frame") {
          this.Clients.addFrames(message.data, message.key)
            .catch(e => {
              throw e;
            })
            .then(m => {
              if (this.Clients.verbose) {
                console.log(Chalk.red(m));
                currentMessage.remove();
              }
            });
        }
      }
    });
  }

  /**
   *
   * @param message
   * @param extraArgs  will be used if relevant express info is needed
   */
  async addMessage(message, extraArgs) {
    this.messageQueue.add({
      aMessage: parseMessage(message, extraArgs)
    });
  }

  logger(msTime) {
    setInterval(_ => {
      this.Clients.getVideoStats();
    }, msTime);
  }
  log() {}
}

module.exports = messageActor;
