# MessageTypes docs

## Types of messages `messageActor` handles

#### Note: All fields are strings, unless noted otherwise

---

##### Client requests start of stream _client -> server_

    type: video,
        request: start
        data: null

##### Server responds with OK _server -> client_

    type: video,
        request: start
        data: Boolean

---

##### Client requests transaction _client -> server_

    type: video,
        request: tx,
        data: hash of frame,
        id: id for client to reference for a frame

##### Server returns txid with unique id

    type: video
        request: tx

---

##### Server removes client from list of connected clients

    type: leave
        data: key

### No response from server calls

##### Client connects to websocket server _client -> server_

Note the data being passed is the ws and req data, but nothing in
the fields like below

    type: connect

---

##### Passed in object as extraArgs

        request: null
        wsKey: req.headers["sec-websocket-key"],
        wsData: ws,
        clientTime: req.url

---

##### Client sends frame data _client -> server_

    type: video,
        request: frame,
        data: decodeBase64 deals with frame data :) // object
        key: sec-websocket-key

---

### No response from client calls

#### Change button text on client page

    type: change
        object: button
        data: String to change button too

---

#### Change textbox text

    type: change
        object: textbox
        data: String
