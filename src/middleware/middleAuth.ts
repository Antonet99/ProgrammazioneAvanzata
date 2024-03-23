require('dotenv').config();
import jwt from 'jsonwebtoken';


export function checkAuthHeader (req: any, res: any, next: any): void{
    if (req.headers.authorization) next();
    else next();
}


export function checkPayloadHeader(req: any, res: any, next: any): void{
    if (req.headers["content-type"] == 'application/json') next();
    else next();
}


export function checkToken(req: any, res: any, next: any): void{
    const bearerHeader: string = req.headers.authorization;
    if (typeof bearerHeader !== 'undefined'){
        const bearerToken: string = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    } else next();
}


export function verifyAndAuthenticate(req: any, res:any, next: any): void {
    try {
        const jwtKey = process.env.JWT_KEY;
        if (!jwtKey) {
            throw new Error('JWT_KEY is not defined');
        }
        const decoded: string | jwt.JwtPayload = jwt.verify(req.token, jwtKey);
        if (decoded != null) {
            req.body = decoded;
            next();
        }
    } catch (error) {
        next(error);
    }
}


 export function checkJSONPayload(req: any, res: any, next: any): void{
    try {
        req.body = JSON.parse(JSON.stringify(req.body));
        next();
    } catch (error) { 
        next(error);
    }
}