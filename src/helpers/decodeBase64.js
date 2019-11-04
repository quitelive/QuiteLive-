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
    let cutData = data.substr(1, data.length - 2);

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
        finalFormattedData.push(JSON.parse("{" + eachFrame + "}"));
      } catch (SyntaxError) {
        throw "Error parsing frame :(";
      }
    });
    return finalFormattedData;
  }
}
module.exports = decode;
