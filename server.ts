import * as dotenv from 'dotenv';

import express from 'express';
import * as mongoose from 'mongoose';
import cors from 'cors';
import bodyParser = require('body-parser');
import UserRouter from './src/src/user/router';
import AIRouter from './src/src/AI/routes';
import RazorRouter from './src/razoorpay/routes';
import  cors from "cors"
export class Server {
  public app: express.Application = express();

  constructor() {
    dotenv.config();

    this.setConfigurations();

    this.setRoutes();
    this.error404Handler();
    this.HandleErrors();
  }

  setConfigurations() {
    this.ConnectMongoDB();
    this.Configurations();
  }

  ConnectMongoDB() {
    const url: any = process.env.DB_URL;
    mongoose.connect(url, () => {
      console.log(`database connected to ${url}`);
    });
  }

  Configurations() {
    this.app.use(
      cors({
        origin: 'http://localhost:3000',
        optionsSuccessStatus: 200,
      })
    );
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }
  // setCors() {

  // }
  setRoutes() {
    // this.setCors();
    this.app.use('/user', UserRouter);
    this.app.use('/ai', AIRouter);
    this.app.use('/razorpay', RazorRouter);
  }
  error404Handler() {
    this.app.use((req, res) => {
      console.log('error not found 404');
      res.status(404).json({
        message: 'Not Found',
        Status_code: 404,
      });
    });
  }

  HandleErrors() {
    this.app.use((error: any, req: any, res: any, next: any) => {
      const errorstatus = req.errorStatus || 400;
      console.log(errorstatus);
      res.status(errorstatus).json({
        message: error.message || 'Something Went Wrong. Please try Again!',
        status_code: errorstatus,
      });
    });
  }
}
