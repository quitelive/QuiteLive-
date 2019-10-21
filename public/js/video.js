// Credit to Alexandru Cambose - alexcambose
// https://github.com/alexcambose/webcam-base64-streaming

// Video Stack
class VideoStack {
  constructor() {
    //this.ID = getId();
    this.videoStack = [];
  }

  popAmount(amount) {
    let framesToReturn = [];
    // framesToReturn.push({ clientID: this.ID }); // ID for each send of frames
    for (let i = 0; i < amount; i++) {
      framesToReturn.push(this.videoStack.pop());
    }
    return JSON.stringify(framesToReturn);
  }

  push(frame, time) {
    this.videoStack.push({
      time: time,
      frame: frame
    });
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
// const video = document.querySelector("video");
//
// // request access to webcam
//
//
let gotVideo = false;
// if (video !== undefined) {
//   video.then(_ => {
//     // Autoplay started!
//     let gotVideo = false;
//     navigator.mediaDevices
//         .getUserMedia({
//           video: { width: 426, height: 240 } // change for user audio
//         })
//         .then(stream => {
//           video.srcObject = stream;
//           gotVideo = true;
//         });
//   }).catch(error => {
//     console.log("error ahhhhh", error)
//   });
// }

// returns a frame encoded in base64
const getFrame = () => {
  if (gotVideo) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const data = canvas.toDataURL("image/png");
    videostack.push(data, 0);
  }

  //return data;
};

const sendFrames = () => {
  const amount = 5;
  for (let i = 0; i < amount; i++) {
    videostack.push(
      [...Array(10)].map(i => (~~(Math.random() * 36)).toString(36)).join("")
    );
  }

  if (gotVideo) {
    ws.send(new Blob(videostack.popAmount(amount)));
  }
  let a = videostack.popAmount(amount);
  console.log("sent");
  ws.send(a);
};

let videostack = new VideoStack();
//const WS_URL = `ws://localhost:5001/?date=${newClient()}`;
//const ngrokURl = "0a3bff65.ngrok.io";
const herokuAddress = "quite-live.herokuapp.com";
const host = location.origin.replace(/^http/, 'ws')
const WS_URL = `${host}/?date=${newClient()}`;
const ws = new WebSocket(WS_URL);

ws.onopen = () => {
  console.log(`Connected to ${WS_URL}`);
  setInterval(sendFrames, 5000);
  setInterval(getFrame, 1000);
  //
  //
  //   setInterval(() => {
  //     ws.send(getFrame());
  //   }, 1000 / FPS);
};
ws.onmessage = message => {
  console.log(message);
};
