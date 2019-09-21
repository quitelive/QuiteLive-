const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {

  console.log("Connected to the signaling server");
  let i = 0;
};
ws.onmessage = function(event) {
  console.log(event.data);
};

ws.onerror = err => {
  console.error(err);
};
