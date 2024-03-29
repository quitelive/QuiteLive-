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

const RequestPromise = require("request-promise");
const Dashjs = require("@dashevo/dashcore-lib");
const Mongoose = require("mongoose");

require("../models/AddressQueue");
const addressQueueSchema = Mongoose.model("AddressQueue");
require("../models/FundAddress");
const fundAddressSchema = Mongoose.model("FundAddress");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  const fs = require("fs");
}

const mongooseURI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PW}@quitelive-1-vjn8k.mongodb.net/test`;

Mongoose.connect(mongooseURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
  .then(() => {
    console.log(`[QuiteLive Wallet] MongoDB Connected`);
  })
  .catch(err => {
    console.error(`[QuiteLive Wallet] Failed to connect to MongoDB Server`);
    console.error(`[QuiteLive Wallet] Cause: ${err}`);
  });

class AddressQueue {
  /**
   * @class
   * Queue for each address. We need this as each address needs time for the tx to confirm
   * Therefor we need a queue to keep track of each address.
   *
   * // TODO: Make Wallet's AddressQueue more efficient
   *    This would be an easyish task as right now we are shuffling each address around a
   *    huge array of objects. Instead, we could use an index counter and just use
   *    indexCounter % NumberOfAddresses to keep track of the current address!
   *
   *
   * @param {object} addresses List of dicts, holding addresses with priv/pub keys. Comes from MongoDb.
   * @param {string} network Defaults to "mainnet", sets what type of network we are using
   *                           either "mainnet" or "testnet".
   */

  constructor(addresses, network = "mainet") {
    this.queue = addresses;
  }

  /**
   * LIFO queue interface for getting next address
   * @return {Object} First address in the queue
   */
  nextAddr() {
    const firstAddress = this.queue.shift();
    this.queue.push(firstAddress);
    return firstAddress;
  }

  /**
   * Gets number of addresses.
   * @return {number} Amount of address in the queue.
   */
  getSize() {
    return this.queue.length;
  }
}

class wallet {
  /**
   * Instantiate a "wallet" of sorts
   */

  constructor() {
    this.loaded = false;
    this.fundAddress = null;
    this.addressQueue = null;
  }

  /**
   * Helper function that loads both FundAddress and AddressQueue addresses from mongoDB
   * @returns {Promise<null>} resolves when it loads both objects
   */
  load() {
    return new Promise(resolve => {
      readFromMongodb("fund").then(data => {
        this.fundAddress = data;
        readFromMongodb("queue").then(data => {
          this.addressQueue = new AddressQueue(data);
          this.loaded = true;
          console.log("[Quite Live Wallet] Loaded wallet from db");
          resolve();
        });
      });
    });
  }
  /**
   * @return {number} Amount of address in the wallet queue
   */
  getQueueSize() {
    return this.addressQueue.getSize();
  }

  /**
   * Sends a tx, returns txid
   * @param {number} amount - amount to send. Defaults to 1 duff/satoshi.
   *
   */
  send(amount = 1) {
    return new Promise((resolve, reject) => {
      if (!this.loaded) reject("Error: load wallet before calling anything");
      let nextAddress = this.addressQueue.nextAddr();
      RequestPromise(
        `http://testnet-insight.dashevo.org/insight-api/addr/${nextAddress.publicKey}/utxo`,
        {
          json: true
        }
      ).then(data => {
        const newPrivateKey = Dashjs.PrivateKey(nextAddress.privateKey);
        let newTX = new Dashjs.Transaction()
          .from(data[0])
          .change(nextAddress.publicKey)
          .to(this.fundAddress.publicKey, amount)
          .feePerKb(1100) // generous tx fee? normal is 1000
          .sign(newPrivateKey);
        RequestPromise.post({
          url: "http://testnet-insight.dashevo.org/insight-api/tx/send",
          body: {
            rawtx: newTX.toString()
          },
          json: true
        })
          .then(data => {
            if (data.statusCode === 200) {
              resolve(data); // bad request
            }
            if (data.txid) {
              resolve(data.txid);
            }
          })
          .catch(data => {
            reject("failed to post tx " + data);
          });
      });
    });
  }

  /**
   * Closes wallet to preserve queue order. Gives time for addresses to confirm there transactions.
   *
   */
  closeWallet() {
    writeToMongoDb("queue", this.addressQueue).then(_ => {
      console.log("[Quite Live Wallet] Saved wallet queue");
    });

    writeToMongoDb("fund", this.fundAddress).then(_ => {
      console.log("[Quite Live Wallet] Saved FundAddress");
    });
  }

  /**
   * Fund all address in wallet file, with dash in `this.fundAddress`
   * @param {int=} amount - amount of dash to fund to each address. Defaults to 100100 duffs, which
   *                              allows 100 transactions: 0.001001 = (0.00001 + 0.00000001) × 100
   *
   */
  fundAddresses(amount = 100100) {
    if (!this.loaded) reject("Error: load wallet before calling anything");
    let fundAddressTX = new Dashjs.Transaction().change(this.fundAddress.publicKey);
    RequestPromise(
      `http://testnet-insight.dashevo.org/insight-api/addr/${this.fundAddress.publicKey}/utxo`,
      { json: true }
    )
      .then(data => {
        // TODO: What do we do with an address that has no history, therefor no utxo
        const utxo = data[0];
        fundAddressTX.from(utxo);

        for (let i = 0; i < this.addressQueue.getSize(); i++) {
          fundAddressTX.to(this.addressQueue.nextAddr().publicKey, amount);
        }
        fundAddressTX.sign(this.fundAddress.privateKey);
        console.log(fundAddressTX.toString());

        RequestPromise.post(
          {
            url: "http://testnet-insight.dashevo.org/insight-api/tx/send",
            body: {
              rawtx: fundAddressTX.toString()
            },
            json: true
          },
          function(error, response, body) {
            // TODO: Do something with this tx?
            if (error) console.log(error, response, body);
          }
        );
      })
      .catch(err => {
        console.log("error in funding tx's");
        console.log("Maybe you did not send any coins to funding address?");
        throw err;
      });
  }
}
// NON CLASS FUNCTIONS

/**
 * Reads data from mongoDB, either fund or queue address/s. If there is no data, create the new wallet
 * @param type {string} Either fund address, or queue addresses.
 * @return {Promise< newWalletFile | createFundAddr >}
 */
const readFromMongodb = type => {
  return new Promise((resolve, reject) => {
    if (type === "queue") {
      addressQueueSchema.findOne({ id: 1 }, (error, addressQueue) => {
        if (addressQueue) resolve(JSON.parse(addressQueue.walletQueue));
        resolve(newWalletFile());
      });
    } else if (type === "fund") {
      fundAddressSchema.findOne({ id: 1 }, (error, fundAddress) => {
        if (fundAddress) resolve(JSON.parse(fundAddress.FundAddressKey));
        resolve(createFundAddr());
      });
    } else reject("Specify a type, either fund or queue");
  });
};

/**
 * Creates a new document containing stringed version of Object, or updates the doc if it exists
 * @param type {string} either fund or queue address
 * @param dataToInsert {Object} - fund or queue address to add to database.
 * @return {Promise< resolve | reject >}
 *
 * // TODO: Optimise writeToMongoDb, tons of repeated code. Needs a helper function.
 */
const writeToMongoDb = (type, dataToInsert) => {
  // TODO: Refactor, remove repeated code
  return new Promise((resolve, reject) => {
    if (type === "queue") {
      // if document doesn't exist
      addressQueueSchema.findOne({ id: 1 }, null, null, (error, dbData) => {
        if (!dbData) {
          console.log("here");
          const newAddressQueue = new addressQueueSchema({
            id: 1,
            // TODO: fix this bug, stringing it is not optimised
            // see https://github.com/Automattic/mongoose/issues/6109 when we don't stringify the data
            walletQueue: JSON.stringify(dataToInsert.queue)
          });
          newAddressQueue.save().then(_ => {
            resolve();
          });
        } else {
          addressQueueSchema.updateOne(
            { id: 1 },
            // see https://github.com/Automattic/mongoose/issues/6109 when we don't stringify the data
            { walletQueue: JSON.stringify(dataToInsert.queue) },
            null,
            (error, returned) => {
              resolve();
            }
          );
        }
      });
    } else if (type === "fund") {
      fundAddressSchema.findOne({ id: 1 }, null, null, (error, dbData) => {
        if (!dbData) {
          console.log("here");
          const fundAddress = new fundAddressSchema({
            id: 1,
            // see https://github.com/Automattic/mongoose/issues/6109 when we don't stringify the data
            FundAddressKey: JSON.stringify(dataToInsert)
          });
          fundAddress.save().then(_ => {
            resolve();
          });
        } else {
          fundAddressSchema.updateOne(
            { id: 1 },
            // see https://github.com/Automattic/mongoose/issues/6109 when we don't stringify the data
            { FundAddressKey: JSON.stringify(dataToInsert) },
            null,
            (error, returned) => {
              resolve();
            }
          );
        }
      });
    }
  });
};

/**
 * Makes a new wallet with `size` as amount of address
 * @param {int=} size - amount of addresses to make
 */

function newWalletFile(size = 1000) {
  const wallet = [];
  for (let i = 0; i < size; i++) {
    let privateKey = new Dashjs.PrivateKey(Dashjs.Networks.testnet);
    let publicKey = new Dashjs.PublicKey(privateKey, Dashjs.Networks.testnet)
      .toAddress()
      .toString();
    let address = {
      privateKey: privateKey,
      publicKey: publicKey,
      balance: 0
    };
    wallet.push(address);
  }
  return wallet;
}

/**
 * Creates a new address, which all further addresses will be funded from
 * @return {{privateKey: PrivateKey, publicKey: string}} new private/public key pair for fund address
 */

function createFundAddr() {
  const privateKey = new Dashjs.PrivateKey(Dashjs.Networks.testnet);
  return {
    privateKey: privateKey,
    publicKey: new Dashjs.PublicKey(privateKey, Dashjs.Networks.testnet)
      .toAddress()
      .toString()
  };
}

module.exports = wallet;
