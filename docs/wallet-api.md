## Classes

<dl>
<dt><a href="#AddressQueue">AddressQueue</a></dt>
<dd><p>Queue for each address. We need this as each address needs time for the tx to confirm
Therefor we need a queue to keep track of each address.</p>
<p>// TODO: Make Wallet&#39;s AddressQueue more efficient
   This would be an easyish task as right now we are shuffling each address around a
   huge array of objects. Instead, we could use an index counter and just use
   indexCounter % NumberOfAddresses to keep track of the current address!</p>
</dd>
<dt><a href="#wallet">wallet</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#readFromMongodb">readFromMongodb(type)</a> ⇒ <code>Promise.&lt;(newWalletFile|createFundAddr)&gt;</code></dt>
<dd><p>Reads data from mongoDB, either fund or queue address/s. If there is no data, create the new wallet</p>
</dd>
<dt><a href="#writeToMongoDb">writeToMongoDb(type, dataToInsert)</a> ⇒ <code>Promise.&lt;(resolve|reject)&gt;</code></dt>
<dd><p>Creates a new document containing stringed version of Object, or updates the doc if it exists</p>
</dd>
<dt><a href="#newWalletFile">newWalletFile([size])</a></dt>
<dd><p>Makes a new wallet with <code>size</code> as amount of address</p>
</dd>
<dt><a href="#createFundAddr">createFundAddr()</a> ⇒ <code>Object</code></dt>
<dd><p>Creates a new address, which all further addresses will be funded from</p>
</dd>
</dl>

<a name="AddressQueue"></a>

## AddressQueue
Queue for each address. We need this as each address needs time for the tx to confirm
Therefor we need a queue to keep track of each address.

// TODO: Make Wallet's AddressQueue more efficient
   This would be an easyish task as right now we are shuffling each address around a
   huge array of objects. Instead, we could use an index counter and just use
   indexCounter % NumberOfAddresses to keep track of the current address!

**Kind**: global class  

* [AddressQueue](#AddressQueue)
    * [new AddressQueue(addresses, network)](#new_AddressQueue_new)
    * [.nextAddr()](#AddressQueue+nextAddr) ⇒ <code>Object</code>
    * [.getSize()](#AddressQueue+getSize) ⇒ <code>number</code>

<a name="new_AddressQueue_new"></a>

### new AddressQueue(addresses, network)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| addresses | <code>object</code> |  | List of dicts, holding addresses with priv/pub keys. Comes from MongoDb. |
| network | <code>string</code> | <code>&quot;mainet&quot;</code> | Defaults to "mainnet", sets what type of network we are using                           either "mainnet" or "testnet". |

<a name="AddressQueue+nextAddr"></a>

### addressQueue.nextAddr() ⇒ <code>Object</code>
LIFO queue interface for getting next address

**Kind**: instance method of [<code>AddressQueue</code>](#AddressQueue)  
**Returns**: <code>Object</code> - First address in the queue  
<a name="AddressQueue+getSize"></a>

### addressQueue.getSize() ⇒ <code>number</code>
Gets number of addresses.

**Kind**: instance method of [<code>AddressQueue</code>](#AddressQueue)  
**Returns**: <code>number</code> - Amount of address in the queue.  
<a name="wallet"></a>

## wallet
**Kind**: global class  

* [wallet](#wallet)
    * [new wallet()](#new_wallet_new)
    * [.load()](#wallet+load) ⇒ <code>Promise.&lt;null&gt;</code>
    * [.getQueueSize()](#wallet+getQueueSize) ⇒ <code>number</code>
    * [.send(amount)](#wallet+send)
    * [.closeWallet()](#wallet+closeWallet)
    * [.fundAddresses([amount])](#wallet+fundAddresses)

<a name="new_wallet_new"></a>

### new wallet()
Instantiate a "wallet" of sorts

<a name="wallet+load"></a>

### wallet.load() ⇒ <code>Promise.&lt;null&gt;</code>
Helper function that loads both FundAddress and AddressQueue addresses from mongoDB

**Kind**: instance method of [<code>wallet</code>](#wallet)  
**Returns**: <code>Promise.&lt;null&gt;</code> - resolves when it loads both objects  
<a name="wallet+getQueueSize"></a>

### wallet.getQueueSize() ⇒ <code>number</code>
**Kind**: instance method of [<code>wallet</code>](#wallet)  
**Returns**: <code>number</code> - Amount of address in the wallet queue  
<a name="wallet+send"></a>

### wallet.send(amount)
Sends a tx, returns txid

**Kind**: instance method of [<code>wallet</code>](#wallet)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| amount | <code>number</code> | <code>1</code> | amount to send. Defaults to 1 duff/satoshi. |

<a name="wallet+closeWallet"></a>

### wallet.closeWallet()
Closes wallet to preserve queue order. Gives time for addresses to confirm there transactions.

**Kind**: instance method of [<code>wallet</code>](#wallet)  
<a name="wallet+fundAddresses"></a>

### wallet.fundAddresses([amount])
Fund all address in wallet file, with dash in `this.fundAddress`

**Kind**: instance method of [<code>wallet</code>](#wallet)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [amount] | <code>int</code> | <code>100100</code> | amount of dash to fund to each address. Defaults to 100100 duffs, which                              allows 100 transactions: 0.001001 = (0.00001 + 0.00000001) × 100 |

<a name="readFromMongodb"></a>

## readFromMongodb(type) ⇒ <code>Promise.&lt;(newWalletFile\|createFundAddr)&gt;</code>
Reads data from mongoDB, either fund or queue address/s. If there is no data, create the new wallet

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | Either fund address, or queue addresses. |

<a name="writeToMongoDb"></a>

## writeToMongoDb(type, dataToInsert) ⇒ <code>Promise.&lt;(resolve\|reject)&gt;</code>
Creates a new document containing stringed version of Object, or updates the doc if it exists

**Kind**: global function  
**Returns**: <code>Promise.&lt;(resolve\|reject)&gt;</code> - // TODO: Optimise writeToMongoDb, tons of repeated code. Needs a helper function.  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | either fund or queue address |
| dataToInsert | <code>Object</code> | fund or queue address to add to database. |

<a name="newWalletFile"></a>

## newWalletFile([size])
Makes a new wallet with `size` as amount of address

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [size] | <code>int</code> | <code>1000</code> | amount of addresses to make |

<a name="createFundAddr"></a>

## createFundAddr() ⇒ <code>Object</code>
Creates a new address, which all further addresses will be funded from

**Kind**: global function  
**Returns**: <code>Object</code> - new private/public key pair for fund address  
