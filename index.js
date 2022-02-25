import express from "express";
import bodyParser from 'body-parser'
import userRouter from './route/users.js'
import thresholdRouter from './route/threshold.js'
import morgan from "morgan";
import helmet from "helmet";
import dotenv from 'dotenv'
import database from './config/database.js'
import mongoose from 'mongoose'
import cors from 'cors';
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
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", 
//     "Origin, X-Requested-With, Content-Type, Accept,Authorization");
//     next();
// });
app.use(cors());

const corsOptions = {
  origin: true,
  credentials: true
}
app.options('*', cors(corsOptions));
app.use(helmet())
app.use(morgan('combined'));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));



app.use('/',userRouter);
app.use('/threshold',thresholdRouter);
app.listen(PORT, ()=>console.log(`App running on the localhost/${PORT}`))
