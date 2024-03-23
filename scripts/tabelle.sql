--UTENTI
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    tokens REAL 
);

--GRAFO
CREATE TABLE graph (
    id_graph SERIAL PRIMARY KEY,
    nodes INTEGER,
    edges INTEGER,
    costo REAL,
    date_time DATE,
    id_creator INTEGER REFERENCES users(id_user)
);

--RICHIESTE AGGIORNAMENTO
CREATE TABLE request (
    id_request SERIAL PRIMARY KEY,
    req_status TEXT,
    metadata JSONB,
    date_time DATE,
    req_users INTEGER REFERENCES users(id_user),
    req_graph INTEGER REFERENCES graph(id_graph)
);

--NODI
CREATE TABLE nodes (
    id_node SERIAL PRIMARY KEY,
    label TEXT,
    ref_graph INTEGER REFERENCES graph(id_graph)
);

--ARCHI
CREATE TABLE edges (
    weights REAL NOT NULL,
    previous_node INTEGER REFERENCES nodes(id_node),
    next_node INTEGER REFERENCES nodes(id_node),
    PRIMARY KEY (previous_node, next_node)
);