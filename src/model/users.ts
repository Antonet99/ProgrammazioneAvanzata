import { raw } from "express";
import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes, where, Transaction } from "sequelize";
import { sendResponse } from "../utils/messages_sender";
import HttpStatusCode from "../utils/http_status_code";
import Message from "../utils/messages_string";

const sequelize = SequelizeDB.getConnection();

export const User = sequelize.define(
  "users",
  {
    id_user: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      values: ["admin", "user"],
      defaultValue: "user",
      allowNull: false,
    },
    tokens: {
      type: DataTypes.REAL,
      defaultValue: 3,
    },
  },
  {
    tableName: "users",
    timestamps: false,
    freezeTableName: true,
  }
);

/**
 * Retrieves a user from the database using their username.
 *
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<Object>} The user retrieved from the database.
 * @throws {Error} If the user is not found.
 */

export async function getUserByUsername(username: string) {
  let user: any;
  user = await User.findOne({
    raw: true,
    where: { username: username },
  });
  if (!user) {
    throw new Error();
  }
  return user;
}

/**
 * Retrieves a user from the database using their ID.
 *
 * @param {number} id_user - The ID of the user to retrieve.
 * @returns {Promise<Object>} The user retrieved from the database.
 */
export async function getUserById(id_user: number) {
  let user: any;
  user = await User.findByPk(id_user, {
    raw: true,
  });
  return user;
}

/**
 * Checks if a user exists in the database using their username.
 *
 * @param {string} username - The username of the user to check.
 * @returns {Promise<Object>} The user retrieved from the database, if they exist.
 */
export async function checkExistingUser(username: string) {
  const user = await User.findOne({
    attributes: ["username"],
    where: { username: username },
  });
  return user;
}

/**
 * Updates a user's token in the database.
 *
 * @param {number} newToken - The new token to set for the user.
 * @param {string} username - The username of the user to update.
 * @param {Transaction} tr - The Sequelize transaction to use.
 * @returns {Promise<void>}
 */
export async function tokenUpdate(
  newToken: Number,
  username: string,
  tr: Transaction
) {
  const user = await User.update(
    {
      tokens: newToken,
    },
    {
      where: { username: `${username}` },
      transaction: tr,
    }
  );
}

/**
 * Validates a user and sends a response if the user is not found.
 *
 * @param {string} username - The username of the user to validate.
 * @param {Response} res - The Express response object to use for sending the response.
 * @returns {Promise<Object|null>} The validated user, or null if the user is not found.
 */
export async function validateUser(username: string, res: Response) {
  const user = await getUserByUsername(username);
  if (!user) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.USER_NOT_FOUND);
    return null;
  }
  return user;
}
