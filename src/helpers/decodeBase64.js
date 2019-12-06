/*
 * Nova Trauben (C) 2019
 *
 * This file is part of QuiteLive.
 * https://www.github.com/1fabunicorn/QuiteLive-API
 *
 * QuiteLive is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * QuiteLive is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with QuiteLive.  If not, see <https://www.gnu.org/licenses/>.
 */
const fs = require("fs");
const util = require("util");

class decode {
  constructor(arrayToCreateFrom) {
    if (!arrayToCreateFrom) throw "decodeBase64 requires frames to decode silly!";
    this.rawData = this.parse(arrayToCreateFrom);
  }
  decode64() {
    return this.rawData;
  }

  /**
   *
   * Decodes frame after websockets sends
   * Websockets only sends strings or Blobs, so we need to parse the data back together
   *
   * @param data -the incoming frame data
   * @returns {
   *      [
   *      {time: 'a', frame: 'b'},
   *      {time: 'c', frame: 'd'},
   *      {time: 'e', frame: 'f'}
   *      ]
   * }
   */
  parse(data) {
    // removes opening and closing [ ]
    let cutData = subString(data, 42, data.length - 2); // Cuts out message type data that is sent with every frame
    // split each frame
    cutData = cutData.split("},{");
    // get rid of first { in array
    cutData[0] = cutData[0].substr(1, cutData[0].length);
    // get rid of last } in last index
    let lastIndOfArr = cutData.length - 1;
    cutData[lastIndOfArr] = cutData[lastIndOfArr].substr(
      0,
      cutData[lastIndOfArr].length - 1
    );
    // formatting done

    // turn each frame string into an object!
    let finalFormattedData = [];

    cutData.forEach(eachFrame => {
      // stick a { and } so it can parse
      try {
        const parsedFrame = JSON.parse("{" + eachFrame + "}");
        parsedFrame.frame = parsedFrame.frame.split(",")[1];
        // first frame we get may be nothing an empty string
        if (parsedFrame.frame !== "") {
          parsedFrame.frame = Buffer.from(parsedFrame.frame, "base64");
        }
        finalFormattedData.push(parsedFrame);
      } catch (e) {
        console.log("Error parsing frame :(");
        throw e;
      }
    });
    return finalFormattedData;
  }
}

const subString = (_string, front, back) => {
  return _string.substr(front, back - front);
};
module.exports = decode;
