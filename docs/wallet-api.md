## Classes

<dl>
<dt><a href="#AddressQueue">AddressQueue</a></dt>
<dd><p>Queue for each address. We need this as each address needs time for the tx to confirm
Therefor we need a queue to keep track of each address</p>
</dd>
<dt><a href="#wallet">wallet</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#getUTXO">getUTXO(address, api)</a> ⇒ <code>Object</code></dt>
<dd><p>BROKEN oh promises...
BIG yuck</p>
</dd>
<dt><a href="#newWalletFile">newWalletFile([size])</a></dt>
<dd><p>Makes a new wallet with <code>size</code> as amount of address</p>
</dd>
<dt><a href="#createFundAddr">createFundAddr([filename])</a></dt>
<dd><p>Creates a new address, which all further addresses will be funded from</p>
</dd>
<dt><a href="#readAddr">readAddr(fileName)</a> ⇒ <code>Object</code></dt>
<dd><p>helper function to read in file from correct format that the saved wallet files are saved in</p>
</dd>
<dt><a href="#writeAddr">writeAddr(data, filename, overwrite)</a></dt>
<dd><p>helper function to write out wallets to file</p>
</dd>
</dl>

<a name="AddressQueue"></a>

## AddressQueue
Queue for each address. We need this as each address needs time for the tx to confirm
Therefor we need a queue to keep track of each address

**Kind**: global class  

* [AddressQueue](#AddressQueue)
    * [new AddressQueue(addresses, network)](#new_AddressQueue_new)
    * [.nextAddr()](#AddressQueue+nextAddr) ⇒ <code>Object</code>
    * [.getSize()](#AddressQueue+getSize) ⇒ <code>number</code>

<a name="new_AddressQueue_new"></a>

### new AddressQueue(addresses, network)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| addresses | <code>string</code> |  | json file to parse, adds address and info to queue |
| network | <code>string</code> | <code>&quot;mainet&quot;</code> | defaults to "mainnet", sets what type of network we are using                           either "mainnet" or "testnet" |

<a name="AddressQueue+nextAddr"></a>

### addressQueue.nextAddr() ⇒ <code>Object</code>
LIFO queue interface for getting next address

**Kind**: instance method of [<code>AddressQueue</code>](#AddressQueue)  
**Returns**: <code>Object</code> - First address in the queue  
<a name="AddressQueue+getSize"></a>

### addressQueue.getSize() ⇒ <code>number</code>
**Kind**: instance method of [<code>AddressQueue</code>](#AddressQueue)  
**Returns**: <code>number</code> - Amount of address in the queue  
<a name="wallet"></a>

## wallet
**Kind**: global class  

* [wallet](#wallet)
    * [new wallet([walletFile], [fundAddressFile], [numberOfAddresses])](#new_wallet_new)
    * [.getQueueSize()](#wallet+getQueueSize) ⇒ <code>number</code>
    * [.send(callback, amount)](#wallet+send) ⇒ <code>string</code>
    * [.closeWallet()](#wallet+closeWallet)
    * [.fundAddresses([amount])](#wallet+fundAddresses)

<a name="new_wallet_new"></a>

### new wallet([walletFile], [fundAddressFile], [numberOfAddresses])
Instantiate a "wallet" of sorts


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [walletFile] | <code>string</code> | <code>&quot;secrets/wallet.json&quot;</code> | Relative file path to json wallet file |
| [fundAddressFile] | <code>string</code> | <code>&quot;secrets/fundAddress.json&quot;</code> | relative file path to json wallet file |
| [numberOfAddresses] | <code>number</code> |  | number of new address to generate |

<a name="wallet+getQueueSize"></a>

### wallet.getQueueSize() ⇒ <code>number</code>
**Kind**: instance method of [<code>wallet</code>](#wallet)  
**Returns**: <code>number</code> - Amount of address in the wallet queue  
<a name="wallet+send"></a>

### wallet.send(callback, amount) ⇒ <code>string</code>
Sends a tx, returns txid

**Kind**: instance method of [<code>wallet</code>](#wallet)  
**Returns**: <code>string</code> - txid of transaction sent  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| callback | <code>function</code> |  | function to call that tries to return txid |
| amount | <code>number</code> | <code>1</code> | amount to send. Defaults to 1 duff |

<a name="wallet+closeWallet"></a>

### wallet.closeWallet()
**Kind**: instance method of [<code>wallet</code>](#wallet)  
<a name="wallet+fundAddresses"></a>

### wallet.fundAddresses([amount])
Fund all address in wallet file, with dash in `this.fundAddress`

**Kind**: instance method of [<code>wallet</code>](#wallet)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [amount] | <code>int</code> | <code>100100</code> | amount of dash to fund to each address. Defaults to 100100 duffs, which                              allows 100 transactions: 0.001001 = (0.00001 + 0.00000001) × 100 |

<a name="getUTXO"></a>

## getUTXO(address, api) ⇒ <code>Object</code>
BROKEN oh promises...
BIG yuck

**Kind**: global function  
**Returns**: <code>Object</code> - - Dict with UTXO data  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| address | <code>String</code> |  | address to get UTXO from |
| api | <code>String</code> | <code>default</code> | which api to fetch data from                                * default is http://testnet-insight.dashevo.org |

<a name="newWalletFile"></a>

## newWalletFile([size])
Makes a new wallet with `size` as amount of address

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [size] | <code>int</code> | <code>1000</code> | amount of addresses to make |

<a name="createFundAddr"></a>

## createFundAddr([filename])
Creates a new address, which all further addresses will be funded from

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [filename] | <code>string</code> | <code>&quot;secrets/fundAddress.json&quot;</code> | filename to write fundAddress data structure too |

<a name="readAddr"></a>

## readAddr(fileName) ⇒ <code>Object</code>
helper function to read in file from correct format that the saved wallet files are saved in

**Kind**: global function  
**Returns**: <code>Object</code> - - Returns save from queue file  

| Param | Type | Description |
| --- | --- | --- |
| fileName | <code>String</code> | filename to read in |

<a name="writeAddr"></a>

## writeAddr(data, filename, overwrite)
helper function to write out wallets to file

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>String</code> |  | data to write out |
| filename | <code>String</code> |  | filename to write too |
| overwrite | <code>Boolean</code> | <code>false</code> | flag which either tells function to overwrite an existing file of the same nme |

