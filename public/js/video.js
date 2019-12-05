// Credit to Alexandru Cambose - alexcambose
// https://github.com/alexcambose/webcam-base64-streaming

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

let newClient = () => {
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

let getWebCam = () => {
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
            alert("Problem getting webcam");
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
  const amount = 5;
  if (gotVideo && requestedVideo) {
    wss.send(createMessage("frame", videostack.popAll()));
  }
  console.log("sent");
};

function buttonClicked() {
  requestedVideo = true;
  wss.send(createMessage("start"));
}

let videostack = new VideoStack();
const host = location.origin.replace(/^http/, "ws");
const WS_URL = `${host}/?date=${newClient()}`;
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
