module.exports = {
  Video: class Video {
    constructor(apiKey) {
      this.apiKey = apiKey;
      this.frames = [];
    }

    addFrame(frame) {
      this.frames.push(frame);
    }

    returnVideo() {
      //
    }

    updateFrame() {
      // method for stenography
    }
  }
};
