document
  .querySelector("#get-access")
  .addEventListener("click", async function init(e) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      const videoTracks = stream.getVideoTracks();
      const track = videoTracks[0];
      alert(`Getting video from: ${track.label}`);
      document.querySelector("video").srcObject = stream;
      document.querySelector("#get-access").setAttribute("hidden", true);
      setTimeout(() => {
        track.stop();
      },
          20 * 1000);
    } catch (error) {
      alert(`${error.name}`);
      console.error(error);
    }
  });
