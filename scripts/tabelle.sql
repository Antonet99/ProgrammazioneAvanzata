CREATE DATABASE pa2;
\c pa2

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
    graph JSONB, 
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
    costo REAL,
    date_time DATE,
    req_users INTEGER REFERENCES users(id_user),
    req_graph INTEGER REFERENCES graph(id_graph)
);