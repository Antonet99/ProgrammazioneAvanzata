import { User } from '../model/model';

export async function register(user: any, res: any) {
    User.create(user).then((user) =>  {
        res.json(user);
    }).catch((error) => {
        res.status(500).send("Errore nella funzione register");
    });
};