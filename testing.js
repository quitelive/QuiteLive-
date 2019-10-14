const Wallet = require("./src/Wallet.js");

let walletInstance = new Wallet();
// walletInstance.send(function(data) {
//   console.log(data);
//   walletInstance.closeWallet();
// });
console.log(walletInstance.getQueueSize());
