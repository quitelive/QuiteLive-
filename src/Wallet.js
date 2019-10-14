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
const fs = require("fs");

class AddressQueue {
  /**
   * @class
   * Queue for each address. We need this as each address needs time for the tx to confirm
   * Therefor we need a queue to keep track of each address
   *
   * @param {string} addresses - json file to parse, adds address and info to queue
   * @param {string} network - defaults to "mainnet", sets what type of network we are using
   *                           either "mainnet" or "testnet"
   */

  constructor(addresses, network = "mainet") {
    if (addresses) {
      let currentAddress;
      for (const address in addresses) {
        currentAddress = addresses[address];
        if (!formatted(currentAddress)) {
          console.log(currentAddress);
          throw "Wallet File Malformed";
        }
        if (currentAddress["privateKey"].network !== network) {
          throw `Wrong wallet type, expecting ${network},
          found ${address["privateKey"].network !== network}`;
        }
      }
      this.queue = [];
      for (let addrIndex in addresses) {
        this.queue.push(addresses[addrIndex]);
      }
      this.numberOfAddresses = addresses.length;
    } else {
      throw "No wallet file/addresses provided";
    }
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
   * @return {number} Amount of address in the queue
   */
  getSize() {
    return this.queue.length;
  }
}

class wallet {
  /**
   * Instantiate a "wallet" of sorts
   * @param {string=} walletFile - Relative file path to json wallet file
   * @param {string=} fundAddressFile - relative file path to json wallet file
   * @param {number=} numberOfAddresses - number of new address to generate
   */

  constructor(
    walletFile = "secrets/wallet.json",
    numberOfAddresses = 1000,
    fundAddressFile = "secrets/fundAddress.json"
  ) {
    this.fundAddress = readAddr(fundAddressFile);
    if (walletFile) {
      this.addressQueue = new AddressQueue(readAddr(walletFile), "testnet");
    } else {
      this.addressQueue = newWalletFile();
    }
  }

  /**
   * @return {number} Amount of address in the wallet queue
   */
  getQueueSize() {
    return this.addressQueue.getSize();
  }

  /**
   * Sends a tx, returns txid
   * @param {function} callback - function to call that tries to return txid
   * @param {number} amount - amount to send. Defaults to 1 duff
   * @return {string} txid of transaction sent
   *
   */
  send(callback, amount = 1) {
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
            return callback(data); // bad request
          }
          if (data.txid) {
            return callback(data.txid);
          }
        })
        .catch(data => {
          return callback("failed to post tx", data);
        });
    });
  }

  /**
   * @classdesc Closes wallet in correct queue order
   */
  closeWallet() {
    writeAddr(this.addressQueue, "wallet.json", true);
  }

  /**
   * Fund all address in wallet file, with dash in `this.fundAddress`
   * @param {int=} amount - amount of dash to fund to each address. Defaults to 100100 duffs, which
   *                              allows 100 transactions: 0.001001 = (0.00001 + 0.00000001) × 100
   *
   */
  fundAddresses(amount = 100100) {
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

/**
 * BROKEN oh promises...
 * BIG yuck
 *
 * @param {String} address - address to get UTXO from
 * @param {String} api     - which api to fetch data from
 *                                * default is http://testnet-insight.dashevo.org
 * @return {Object}        - Dict with UTXO data
 */
function getUTXO(address, callback, api = "default") {
  if (api === "default") {
    RequestPromise(
      `http://testnet-insight.dashevo.org/insight-api/addr/${address}/utxo`,
      {
        json: true
      }
    )
      .then(response => {
        return callback(response[0]);
      })
      .catch(error => {
        return callback(error);
      });
  } else {
    return callback("no api specified");
  }
}

// NON CLASS FUNCTIONS

function formatted(obj, template = "default") {
  return "publicKey" in obj && "privateKey" in obj;
}

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
 * @param {string=} filename - filename to write fundAddress data structure too
 */

function createFundAddr(filename = "secrets/fundAddress.json") {
  const privateKey = new Dashjs.PrivateKey(Dashjs.Networks.testnet);
  let fundAddress = {
    privateKey: privateKey,
    publicKey: new Dashjs.PublicKey(privateKey, Dashjs.Networks.testnet)
      .toAddress()
      .toString()
  };
  writeAddr(fundAddress, filename);
}

/**
 * helper function to read in file from correct format that the saved wallet files are saved in
 * @param {String} fileName - filename to read in
 * @return {Object}         - Returns save from queue file
 */

function readAddr(fileName) {
  return JSON.parse(fs.readFileSync(fileName, "utf8"));
}

/**
 * helper function to write out wallets to file
 * @param {String} data - data to write out
 * @param {String} filename - filename to write too
 * @param {Boolean} overwrite - flag which either tells function to overwrite an existing file of the same nme
 */
function writeAddr(data, filename, overwrite = false) {
  if (data.hasOwnProperty("queue")) {
    let dataToFile = data.queue;
    if (overwrite) {
      fs.writeFileSync(
        "secrets/" + filename,
        JSON.stringify(dataToFile, null, 2),
        "utf-8",
        function(err) {
          if (err) throw err;
        }
      );
    } else {
      filename = filename.split(".");
      fs.writeFileSync(
        `secrets/${filename[0]}.new.${filename[1]}`,
        JSON.stringify(dataToFile, null, 2),
        {
          options: "utf-8"
        },
        function(err) {
          if (err) throw err;
        }
      );
    }
  }
  return "Wrong data structure to write out using this function";
}

module.exports = wallet;
