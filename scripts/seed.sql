DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS graph;
DROP TABLE IF EXISTS request;

CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    role user_role DEFAULT 'user',
    tokens REAL DEFAULT 10
);
CREATE TABLE graph (
    id_graph SERIAL PRIMARY KEY,
    graph JSONB, 
    nodes INTEGER,
    edges INTEGER,
    graph_cost REAL,
    timestamp TIMESTAMPTZ,
    id_creator INTEGER REFERENCES users(id_user)
);
CREATE TABLE request (
    id_request SERIAL PRIMARY KEY,
    req_status request_status,
    metadata JSONB,
    req_cost REAL,
    timestamp TIMESTAMPTZ,
    req_users INTEGER REFERENCES users(id_user),
    req_graph INTEGER REFERENCES graph(id_graph)
);

INSERT INTO users (username, email, role) VALUES
('user1', 'user1@email.com', 'user'),
('user2', 'user2@email.com', 'user'),
('admin1', 'admin1@email.com', 'admin');;