module.exports = {
  Clients: class Clients {
    constructor() {
      this.ids = []; // array for making sure we don't assign clients the same id
      this.connected = {};
      //     connected = {
      //        "[IP Address Of Client]" {
      //            connected: boolean
      //            id: string (16 bit hex string)
      //         }
      //    }
    }

    newConnection(IP) {
      const id = this.makeNewId();
      if (!this.contains(IP)) {
        this.connected[IP] = {
          connected: true,
          id: id
        };
      } else {
        return "AlreadyConnected";
      }
    }

    removeConnection(IP) {
      if (!this.contains(IP)) {
        delete this.connected[IP];
        this.ids = this.ids.filter(e => e !== IP); // remove IP from IDs array
      } else {
        return "AlreadyDisconnected";
      }
    }

    contains(IP) {
      return IP in this.connected;
    }

    // return new ID that is not being used already
    makeNewId() {
      let foundOne = true;
      while (foundOne) {
        let id = crypto.randomBytes(16).toString("hex");
        if (!(id in this.ids)) {
          foundOne = false;
        }
      }
      this.ids.push(id);
      return id;
    }
  }
};
