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

const flatted = require("flatted");
/**
 * @param extraArgs ws initial connection info, only for first connection
 * @param data string
 */

const parseMessage = (data, extraArgs) => {
  if (data === "leave") {
    return {
      type: data,
      data: extraArgs
    };
  }
  if (data === "connect") {
    // special case where extra args coming from express req are
    // a circular array, where JSON.parse will not work.
    return {
      type: data,
      data: JSON.parse(flatted.stringify(extraArgs))
    };
  } else {
    const parseData = JSON.parse(data);
    if (parseData.request === "frame") {
      return {
        type: parseData.type,
        request: parseData.request,
        data: parseData.data, // let's see if this works
        key: extraArgs.key
      };
    } else {
      return {
        type: parseData.type,
        request: parseData.request,
        data: parseData, // let's see if this works
        key: extraArgs.key
      };
    }
  }
};
module.exports = parseMessage;
