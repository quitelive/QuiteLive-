// Credit to Alexandru Cambose - alexcambose
// https://github.com/alexcambose/webcam-base64-streaming

// TODO: Fix bug with button only changing on second click

//TODO: Convert frames to buffers, use jimp
// https://github.com/oliver-moran/jimp/issues/420#issuecomment-375313190

// message sender
const createMessageScemeas = function(request, data) {
  if (request === "start") {
    return {
      type: "video",
      request: "start"
    };
  }

  // data = [hash of frame, id]
  if (request === "tx") {
    return {
      type: "video",
      request: "tx",
      data: data[0],
      id: data[1]
    };
  }
  if (request === "frame") {
    return {
      type: "video",
      request: "frame",
      data: data
    };
  }
};

const createMessage = (request, data) => {
  const message = createMessageScemeas(request, data);
  return JSON.stringify(message);
};

// Video Stack
class VideoStack {
  constructor() {
    //this.ID = getId();
    this.videoStack = [];
  }

  popAll() {
    const message = createMessageScemeas("frame", this.videoStack);
    this.clearStack();
    return JSON.stringify(message);
  }

  clearStack() {
    this.videoStack = [];
  }

  push(frame, time) {
    this.videoStack.push({
      time: time,
      frame: frame
    });
  }
}

class timer {
  constructor() {
    this.time = new Date();
  }
  getTime() {
    const currentDate = new Date();
    const time = (currentDate - this.time) / 1000; // convert ms to s
    const seconds = time % 60;
    return `${seconds.toFixed(2)}`;
  }
}

class button {
  /**
   *
   *
   * @param currentState
   *                "state1": {
   *                  "description": "description for state"
   *                  messageWhenClicked: {
   *                    request: request type,
   *                    data: data being passed in
   *                  }
   *                }
   *
   * @param id The html id the button will be inserted in
   */
  constructor(currentState, id) {
    this.currentState = currentState;
    this.htmlID = id;
    this._button = document.createElement("button");

    this.renderButton();
  }
  changeState(nextState) {
    if (this.currentState.includes(nextState)) {
      this.currentState = nextState;
    } else {
      throw "Invalid Button State Change";
    }
  }

  onClick() {
    this.currentState.messageOnClick().then();
  }

  disable() {
    this._button.disabled = "disabled";
  }
  enable() {
    this._button.enable = "enable";
  }

  /**
   * Return name of current state for html purposes
   */
  getName() {
    return this.currentState.description;
  }

  setState(state) {
    this.currentState = state;
    this.renderButton();
  }

  renderButton() {
    // TODO: Can change this to its own one time method, as it only needs to happen once
    this._button.setAttribute("class", "btn btn-outline-success btn-lg btn-block");
    // make sure to link correct buttonClicked func with instantiated button class
    this._button.setAttribute("onclick", "buttonClicked()");
    if (this.currentState.image) {
      // not working
      this._button.innerHTML =
        this.getName() +
        ' <img src="files/play-load.gif" alt="Loading image" height="42" width="42"> ';
    } else {
      this._button.innerHTML = this.getName();
    }
    this._button.innerHTML = this.getName();
    let wrapperDiv = document.getElementById(this.htmlID);
    wrapperDiv.appendChild(this._button);
  }
}

// All button states
const playState = {
  description: "Start Video",
  messageOnClick: _ => {
    return new Promise(resolve => {
      requestedVideo = true;
      if (gotVideo) { // TODO: Here. debug two click thing
        wss.send(createMessage("start"));
        primaryButton.disable();
        primaryButton.setState(recordingState);
        resolve();
      }
    });
  }
};

const recordingState = {
  description: "Recording",
  image: "files/play-load.gif",
  messageOnClick: _ => {}
};

class messageBox {
  constructor(htmlID) {
    this.header = document.createElement("h4");
    this.message = document.createElement("p");
    this.htmlID = htmlID;
    this.initialize(); // display message with start state
  }
  initialize() {
    this.render();
    this.setHeader("Press to start recording");
    this.setMessage("Once done, this video will be provably live by anyone");
  }

  render() {
    this.header.setAttribute("class", "alert-heading messageBoxText");
    this.message.setAttribute("class", "messageBoxText messageBoxP");
    const wrapperDiv = document.getElementById(this.htmlID);
    wrapperDiv.appendChild(this.header);
    wrapperDiv.appendChild(this.message);
  }
  setHeader(newHeader) {
    this.header.innerText = newHeader;
  }
  setMessage(newMessage) {
    this.message.innerText = newMessage;
  }
}

const primaryMessageBox = new messageBox("messageBox");
const primaryButton = new button(playState, "buttonDiv"); // fill in id

function buttonClicked() {
  primaryButton.onClick();
}

let newClientSchema = () => {
  const d = new Date();
  const newClientToken = {
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
    second: d.getSeconds()
  };

  return JSON.stringify(newClientToken);
};

let getId = (size = 36) => {
  return [...Array(size)].map(i => (~~(Math.random() * 36)).toString(36)).join("");
};

// get video dom element

// request access to webcam

let gotVideo = false;
let requestedVideo = false; // only ask for video if user asks
let requestedVideoHappened = false; // set flag so we don't to the bellow over again
let videoTime;

const video = document.querySelector("video");
const promiseVideo = document.querySelector("video").play();

let getWebCam = _ => {
  // TODO: change to promise, instead of setTimeout
  if (requestedVideo && !requestedVideoHappened) {
    if (promiseVideo !== undefined) {
      promiseVideo.then(_ => {
        // Autoplay started!
        navigator.mediaDevices
          .getUserMedia({
            video: { width: 600, height: 800 } // change for user audio
          })
          .then(stream => {
            videoTime = new timer();
            video.srcObject = stream;
            gotVideo = true;
            requestedVideoHappened = true;
          })
          .catch(error => {
            primaryMessageBox.setMessage("Error Getting Webcam");
          });
      });
    }
  }
};

// returns a frame encoded in base64
const getFrame = () => {
  if (gotVideo && requestedVideo) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const frame = canvas.toDataURL("image/png");
    //const frame = [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join(""); // for testing, so we don't get a massive string
    videostack.push(frame, videoTime.getTime());
  }
};

const wsMessageHandler = message => {
  let parsedMessage = JSON.parse(message);
  console.log(parsedMessage);
};

const sendFrames = _ => {
  if (gotVideo && requestedVideo) {
    wss.send(createMessage("frame", videostack.popAll()));
    console.log("sent");
  } else {
    console.log("not sent");
  }
};

let videostack = new VideoStack();
const host = location.origin.replace(/^http/, "ws");
const WS_URL = `${host}/?date=${newClientSchema()}`;
const wss = new WebSocket(WS_URL);

setInterval(getWebCam, 500);

wss.onopen = () => {
  console.log(`Connected to ${WS_URL}`);
  setInterval(sendFrames, 5000);
  setInterval(getFrame, 1000);
};

wss.onmessage = message => {
  wsMessageHandler(message.data);
};
