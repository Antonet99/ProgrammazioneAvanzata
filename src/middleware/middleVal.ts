// middleware per la validazione del payload contenente il grafo

export function checkPayloadHeader(req: any, res: any, next: any) {
    if ((req.body).length == 0) {
        res.status(400).send("Payload vuoto");
    }
    else {
        next();
    }
}

