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

class Clients {
  constructor() {
    this.connectedClients = [];
    this.clientVideoFrames = [];
    this.clientAudio = [];
  }

  addClient(secWebsocketKey, websocketData, date) {
    // assuming param is "date" as it looks for the 7th index in string
    const cleanedDate = date.substr(7).replace(/%22/g, '"'); // %22 is how ["] is transmitted
    const d = JSON.parse(cleanedDate);
    const newClient = {
      id: secWebsocketKey,
      websocketData: websocketData,
      time: {
        day: d.day,
        hour: d.hour,
        minute: d.minute,
        second: d.second
      }
    };
    this.connectedClients.push(newClient);
    this.clientVideoFrames.push(newVideo(secWebsocketKey));
  }

  getId(secWebsocketKey) {
    this.connectedClients.forEach(clients => {
      if (clients.id === secWebsocketKey) {
        return clients.websocketData;
      }
    });
    return null;
  }

  addFrames(data, id) {
    const arrayedData = JSON.parse(data); // data comes in as a string... YUCK!
    let success = false;
    // convert?
    this.clientVideoFrames.forEach(videoFrames => {
      if (videoFrames.id.localeCompare(id) === 0) {
        arrayedData.forEach(frame => {
          videoFrames.frames.push(frame);
          success = true;
        });
      }
    });
    if (!success) throw "failed to add frames";
  }
  //
  //   newConnection(IP) {
  //     const id = this.makeNewId();
  //     if (!this.contains(IP)) {
  //       this.connected[IP] = {
  //         connected: true,
  //         id: id
  //       };
  //     } else {
  //       return "AlreadyConnected";
  //     }
  //   }
  //
  //   removeConnection(IP) {
  //     if (!this.contains(IP)) {
  //       delete this.connected[IP];
  //       this.ids = this.ids.filter(e => e !== IP); // remove IP from IDs array
  //     } else {
  //       return "AlreadyDisconnected";
  //     }
  //   }
  //
  //   contains(IP) {
  //     return IP in this.connected;
  //   }
  //
  //   // return new ID that is not being used already
  //   makeNewId() {
  //     let foundOne = true;
  //     while (foundOne) {
  //       let id = crypto.randomBytes(16).toString("hex");
  //       if (!(id in this.ids)) {
  //         foundOne = false;
  //       }
  //     }
  //     this.ids.push(id);
  //     return id;
  //   }
  // }
}

const newVideo = secWebsocketKey => {
  return {
    id: secWebsocketKey,
    frames: []
  };
};

module.exports = Clients;
