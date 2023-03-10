import { validationResult } from 'express-validator';
import * as jwt from 'jsonwebtoken';
import { Error } from 'mongoose';
import UserModel from '../src/user/model';
export class GlobalMiddleWare {
  static checkError(req: any, res: any, next: any) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      console.log({ error: error.array() });
      next(res.json({ error: error.array() }));
    } else {
      next();
    }
  }
  static async checkRequest(req: any, res: any, next: any) {
    try {
      const secret: any = process.env.JWT_SECRET_KEY;
      const authHeader = req.headers.authorization;
      console.log(req.headers);
      if (authHeader) {
        const token = await authHeader.split(' ')[1];
        const verify = await jwt.verify(token, secret, async (err: any, decoded: any) => {
          if (err) {
            next(err);
          } else if (!decoded) {
            req.errorStatus = 401;
            next(new Error('User Not Authorised'));
          } else {
            const user = (req.user = decoded);
            console.log(user);
            if (!user.requestBalance) {
              next(new Error('balance is closed'));
            } else {
              await UserModel.updateOne({ _id: decoded._id }, { $inc: { requestBalance: -1 } });
            }
            next();
          }
        });
      } else {
        res.send({ message: 'jwt not provided' });
      }
    } catch (error) {
      res.send({ message: 'Middleware not working' });
      req.errorStatus = 401;
      console.log(error, 'error');
      next(error);
    }
  }
  static async authenticate(req: any, res: any, next: any) {
    try {
      const secret: any = process.env.JWT_SECRET_KEY;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = await authHeader.split(' ')[1];
        const verify = await jwt.verify(token, secret, (err: any, decoded: any) => {
          if (err) {
            next(err);
          } else if (!decoded) {
            req.errorStatus = 401;
            next(new Error('User Not Authorised'));
          } else {
            req.user = decoded;

            next();
          }
        });
      } else {
        res.send({ message: 'jwt not provided' });
      }
    } catch (error) {
      res.send({ message: 'Middleware not working' });
      req.errorStatus = 401;
      console.log(error, 'error');
      next(error);
    }
  }
}
