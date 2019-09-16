const Video = class Video {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.frames = [];
    }
    addFrame(frame) {
        this.frames.push(frame)
    }
    returnVideo() {
        //
    }
    updateFrame() {
        // method for stenography
    }

};
const v = new Video("adsad");
v.addFrame("hello");
console.log(v);