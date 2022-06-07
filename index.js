import express from "express";
import bodyParser from 'body-parser'
import CookieParser from "cookie-parser";
import Session from "express-session";
import userRouter from './route/users.js'
import thresholdRouter from './route/threshold.js'
import twoFactorRouter from "./model/twoFactor.js";
import Verify from './route/verify.js';
import AdminRouter from './route/admin.js';
import morgan from "morgan";
import helmet from "helmet";
import dotenv from 'dotenv'
import database from './config/database.js'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { NoncurrentVersionTransition } from "@aws-sdk/client-s3";
import timeout from 'connect-timeout'
const oneDay = 1000 * 60 * 60 * 24;
const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();

const MONGO_URI = 'mongodb+srv://odewumit:Ademilola@cluster0.9ymuh.mongodb.net/jupit_app?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true'
    mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });



// app.use(bodyParser.json());

// app.set("trust proxy",1);
// app.use(timeout('20s'))
// app.use(haltOnTimedout);
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cors());

const corsOptions = {
  origin: true,
  credentials: true
}
app.options('*', cors(corsOptions));

//app.use(cors({ credentials: true, origin: true }));
app.use(helmet())
app.use(morgan('combined'));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(CookieParser());

app.use('/',userRouter);
app.use('/threshold',thresholdRouter);
app.use('/twofactor',twoFactorRouter);
app.use('/verify',Verify);
app.use('/admin',AdminRouter)

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}
app.listen(PORT, ()=>console.log(`App running on the localhost/${PORT}`))
