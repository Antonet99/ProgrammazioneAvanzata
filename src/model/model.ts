import { SequelizeDB } from "./sequelize";
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = SequelizeDB.getConnection();

export const User = sequelize.define('users', {
    id_user: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.TEXT,
        unique: true
    },
    email: {
        type: DataTypes.TEXT,
        unique: true
    },
    tokens : {
        type: DataTypes.REAL,
        defaultValue: 3
    },
});

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
});

export const Request = sequelize.define('request', {
    id_request: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    req_status : {
        type: DataTypes.TEXT
    },
    metadata : {
        type: DataTypes.JSONB
    },
    date_time: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('NOW')
    },
    req_user: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id_user'
        }
    },
    req_graph: {
        type: DataTypes.INTEGER,
        references: {
            model: Graph,
            key: 'id_graph'
        }
    }
});

export const Nodes = sequelize.define('nodes', {
    id_node: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    label : {
        type: DataTypes.TEXT
    },
    ref_graph: {
        type: DataTypes.INTEGER,
        references: {
            model: Graph,
            key: 'id_graph'
        }
    }
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
});
