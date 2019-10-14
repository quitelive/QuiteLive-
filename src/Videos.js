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

module.exports = {
  Video: class Video {
    constructor() {
      this.frames = {};
      // this.frames = {ID: {
      //                     frames: []
      //               }
    }
    addFrame(frame, ID) {
      if (!ID in this.frames) {
        this.frames[ID];
      }
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
