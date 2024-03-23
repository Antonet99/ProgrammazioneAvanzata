import { SequelizeDB } from "../singleton/sequelize";
import { Sequelize, DataTypes } from 'sequelize';
import { Graph } from './graph';

const sequelize = SequelizeDB.getConnection();

export const Nodes = sequelize.define('nodes', {
    id_node: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    label : {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ref_graph: {
        type: DataTypes.INTEGER,
        references: {
            model: Graph,
            key: 'id_graph'
        }
    }
},
  {
    tableName: 'nodes',
    timestamps: false,
    freezeTableName: true
  });

export const Edges = sequelize.define('edges', {
    previous_node: {
        type: DataTypes.INTEGER,
        references: {
            model: Nodes,
            key: 'id_node'
        },
        primaryKey: true
    },
    next_node: {
        type: DataTypes.INTEGER,
        references: {
            model: Nodes,
            key: 'id_node'
        },
        primaryKey: true
    },
    weights: {
        type: DataTypes.REAL,
        allowNull: false
    }
},
  {
    tableName: 'edges',
    timestamps: false,
    freezeTableName: true
  });