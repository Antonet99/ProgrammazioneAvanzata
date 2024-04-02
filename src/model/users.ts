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

export async function getUserByUsername(username: string) {
  let user: any;
  user = await User.findOne({
    raw: true,
    where: { username: username },
  });
  return user;
}

export async function getUserById(id_user: number) {
  let user: any;
  user = await User.findByPk(id_user, {
    raw: true,
  });
  return user;
}

export async function checkExistingUser(username: string) {
  const user = await User.findOne({
    attributes: ["username"],
    where: { username: username },
  });
  return user;
}

export async function tokenUpdate(
  newToken: Number,
  username: string,
  tr: Transaction
) {
  //, tr : sequelize.Transaction
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

export async function validateUser(username: string, res: Response) {
  const user = await getUserByUsername(username);
  if (!user) {
    sendResponse(res, HttpStatusCode.NOT_FOUND, Message.USER_NOT_FOUND);
    return null;
  }
  return user;
}
