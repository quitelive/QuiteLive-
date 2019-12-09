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

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

// TODO: Optimisations can be done to this circular array.
//  Such as "caching", in the sense that after we have a copy of the address,
//  we only send back the index we are currently at to the db.

const addressQueue = new Schema({
  id: {
    type: Number,
    required: true
  },

  walletQueue: {
    type: String, // see https://github.com/Automattic/mongoose/issues/6109 when we don't stringify the data
    required: true
  }
});

Mongoose.model("AddressQueue", addressQueue);
