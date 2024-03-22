require('dotenv').config();
import { Sequelize } from 'sequelize';
/**
 * Classe 'SequelizeSingleton'
 * 
 * Classe che si occupa di assicurare la presenza di una singola istanza di un oggetto durante il 
 * ciclo di vita del servizio. L'oggetto è utilizzato per costruire la connessione al database
 * attraverso la libreria {@link Sequelize}.
 */

export class SequelizeDB {

    private static instance: SequelizeDB;
    private connection: Sequelize;

    private constructor() {
        if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_HOST || !process.env.DB_PORT) {
            throw new Error('Missing environment variable');
        }

        this.connection = new Sequelize(
            process.env.DB_NAME, 
            process.env.DB_USER, 
            process.env.DB_PASS, 
            {
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                dialect: 'mariadb',
            }
        );
    }

    public static getConnection(): Sequelize {
        if (!SequelizeDB.instance) {
            SequelizeDB.instance = new SequelizeDB();
        }
        return SequelizeDB.instance.connection;
    }
}