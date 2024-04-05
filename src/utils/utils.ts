import sequelize from "sequelize";

require("dotenv").config();

export var alpha: number;

export function nodes_count(obj: object): number {
  let unique_nodes = new Set<any>();

  for (let key in obj) {
    unique_nodes.add(key);
    if (typeof (obj as any)[key] === "object") {
      for (let ikey in (obj as any)[key]) {
        //console.log(ikey);
        unique_nodes.add(ikey);
      }
    }
  }
  //console.log(unique_nodes);
  return unique_nodes.size;
}

export function edges_count(obj: object): number {
  let counter: number = 0;
  for (let key in obj) {
    //console.log(obj[key]);
    counter += Object.keys((obj as any)[key]).length;
  }
  return counter;
}

export function checkAlpha() {
  console.log(process.env.ALPHA!);
  try {
    alpha = parseFloat(process.env.ALPHA!);
    console.log(alpha);
    if (alpha <= 0 || alpha > 1) {
      throw Error("Invalid alpha");
    }
  } catch (error) {
    console.log("Alpha non impostato correttamente, impostato ad 0.8");
    alpha = 0.8;
  }
}

export function exp_avg(old_weight: number, new_weight: number): number {
  return alpha * old_weight + (1 - alpha) * new_weight;
}

export function getDateCondition(startDate?: Date, endDate?: Date) {
  let whereCondition = {};
  const Op = sequelize.Op;

  if (startDate && endDate) {
    whereCondition = {
      timestamp: {
        [Op.between]: [startDate, endDate],
      },
    };
  } else if (startDate) {
    whereCondition = {
      timestamp: {
        [Op.gte]: startDate,
      },
    };
  } else if (endDate) {
    whereCondition = {
      timestamp: {
        [Op.lte]: endDate,
      },
    };
  }
  return whereCondition;
}

export function getReqStatusCondition(req_status: string) {
  if (!req_status) {
    return false;
  }

  if (req_status == "accepted" || req_status == "denied") {
    return true;
  }

  return false;
}
