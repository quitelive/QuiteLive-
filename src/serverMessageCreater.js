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

const messageSchema = (type, request, data, id) => {
  if (id) {
    return {
      type: type,
      request: request,
      data: data,
      id: id
    };
  } else {
    return {
      type: type,
      request: request,
      data: data
    };
  }
};

let createMessage = (type, request, data) => {
  if (type === "video" && request === "start") {
    if (typeof data !== "boolean") {
      throw "data for type video & request start must be bool";
    }
    return JSON.stringify(messageSchema(type, request, data));
  }

  // data[0[ = txid, data[1] = id
  if (type === "video" && request === "tx") {
    if (typeof data !== "string") {
      throw "data for type video & request tx must be string";
    }
    return JSON.stringify(messageSchema(type, request, data[0], data[1]));
  }

};

module.exports = createMessage;
