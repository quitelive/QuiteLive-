// Credit to Alexandru Cambose - alexcambose
// https://github.com/alexcambose/webcam-base64-streaming

// Video Stack
class VideoStack {
  constructor() {
    //this.ID = getId();
    this.videoStack = [];
  }

  popAll() {
    let framesToReturn = this.videoStack;
    this.videoStack = [];
    // framesToReturn.push({ clientID: this.ID }); // ID for each send of frames
    // for (let i = 0; i < this.videoStack.length; i++) {
    //   framesToReturn.push(this.videoStack.pop());
    // }
    console.log(framesToReturn.length);
    return JSON.stringify(framesToReturn);
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
const video = document.querySelector("video");
const promiseVideo = document.querySelector("video").play();

// // request access to webcam

let gotVideo = false;
let videoTime;

if (promiseVideo !== undefined) {
  promiseVideo
    .then(_ => {
      // Autoplay started!
      navigator.mediaDevices
        .getUserMedia({
          video: { width: 800, height: 600 } // change for user audio
        })
        .then(stream => {
          videoTime = new timer();
          video.srcObject = stream;
          gotVideo = true;
        });
    })
    .catch(error => {
      console.log("error ahhhhh", error);
    });
}

// returns a frame encoded in base64
const getFrame = () => {
  if (gotVideo) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const frame = canvas.toDataURL("image/png");
    // const frame = getId(); // for testing, so we don't get a massive string
    videostack.push(frame, videoTime.getTime());
  }

  //return data;
};

const sendFrames = () => {
  const amount = 5;
  // for (let i = 0; i < amount; i++) {
  //   videostack.push(
  //     [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join("")
  //   );
  // }

  if (gotVideo) {
    wss.send(videostack.popAll());
  }
  console.log("sent");
};

let videostack = new VideoStack();
const host = location.origin.replace(/^http/, "ws");
const WS_URL = `${host}/?date=${newClient()}`;
const wss = new WebSocket(WS_URL);

wss.onopen = () => {
  console.log(`Connected to ${WS_URL}`);
  setInterval(sendFrames, 5000);
  setInterval(getFrame, 1000);
};
wss.onmessage = message => {
  console.log(message);
};
