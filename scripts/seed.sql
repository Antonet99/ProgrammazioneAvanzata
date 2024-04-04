DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS graph;
DROP TABLE IF EXISTS request;

CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'denied');

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY NOT NULL,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    tokens REAL DEFAULT 10 NOT NULL
);
CREATE TABLE graph (
    id_graph SERIAL PRIMARY KEY NOT NULL,
    graph JSONB NOT NULL, 
    nodes INTEGER NOT NULL,
    edges INTEGER NOT NULL,
    graph_cost REAL NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    id_creator INTEGER REFERENCES users(id_user) NOT NULL
);
CREATE TABLE request (
    id_request SERIAL PRIMARY KEY NOT NULL,
    req_status request_status NOT NULL,
    metadata JSONB NOT NULL,
    req_cost REAL NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    req_users INTEGER REFERENCES users(id_user) NOT NULL,
    req_graph INTEGER REFERENCES graph(id_graph) NOT NULL
);

INSERT INTO users (username, email, role) VALUES
('user1', 'user1@email.com', 'user'),
('user2', 'user2@email.com', 'user'),
('admin1', 'admin1@email.com', 'admin');;

SET timezone = 'Europe/Rome';

