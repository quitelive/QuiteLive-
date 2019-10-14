// Credit to Alexandru Cambose - alexcambose
// https://github.com/alexcambose/webcam-base64-streaming

// get video dom element
const video = document.querySelector("video");

// request access to webcam
navigator.mediaDevices
  .getUserMedia({
    video: { width: 426, height: 240 } // change for user audio
  })
  .then(stream => (video.srcObject = stream));
// returns a frame encoded in base64
const getFrame = () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const data = canvas.toDataURL("image/png");
  return data;
};
const WS_URL = "ws://localhost:5001";
const FPS = 60;
const ws = new WebSocket(WS_URL);
ws.onopen = () => {
  console.log(`Connected to ${WS_URL}`);
  setInterval(() => {
    ws.send(getFrame());
  }, 1000 / FPS);
};
