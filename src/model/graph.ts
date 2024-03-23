import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes } from 'sequelize';
import { User } from './user';

const sequelize = SequelizeDB.getConnection();

export const Graph = sequelize.define('graph', {
    id_graph: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nodes : {
        type: DataTypes.INTEGER
    },
    edges : {
        type: DataTypes.INTEGER
    },
    costo : {
        type: DataTypes.INTEGER
    },
    date_time: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('NOW')
    },
    id_creator: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id_user'
        }
    }
},
  {
    tableName: 'graph',
    timestamps: false,
    freezeTableName: true
  }
);