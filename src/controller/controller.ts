import { User, } from '../model/user';
const GraphD = require("node-dijkstra");
import { Request, Response } from 'express';
import * as Utils from '../utils/utils'


export async function register(user: any, res: any) {
    User.create(user).then((user) =>  {
        res.json(user);
    }).catch((error) => {
        res.status(500).send("Errore nella funzione register");
    });
};

export async function createGraph(req: Request, res: Response) { //teoricamente anche l'id dell'user deve essere passato
    
    const graph = new GraphD(req.body);

    // calcolo dimensione
    let nodes = Utils.nodes_count(req.body);
    let edges = Utils.edges_count(req.body);

    // calcolo costi
    let total_cost = (nodes * 0.1 + edges * 0.02);

    let resp = {
        "nodes" : nodes,
        "edges" : edges,
        "total_cost" : parseFloat(total_cost.toFixed(2))
    }

    res.json(resp);
    
    // validazione payload


    // inserimento in db tramite Graph model
};


/*
let str : string = `{
        'A': {
          'B': 1
        },
        'B': {
          'A': 1,
          'C': 2,
          'D': 4
        }
      }`;

    let j = JSON.parse(str.replace(/'/g, '"'));
*/