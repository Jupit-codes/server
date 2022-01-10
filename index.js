import express from "express";
import bodyParser from 'body-parser'
import userRouter from './route/users.js'
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



app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(helmet())
app.use(morgan('combined'));

app.use('/',userRouter);

app.listen(PORT, ()=>console.log(`App running on the localhost/${PORT}`))
