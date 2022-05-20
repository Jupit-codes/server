
import express from "express";
import cloudinary from 'cloudinary'
import nodemailer from 'nodemailer';


  const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtppro.zoho.com",
       auth: {
            user:'hello@jupitapp.co',
            pass:'rVhjJ7SPzZ0z'
            // pass:'ii84NsMqT9Xv'
         },
    secure: true,
    });

const router = express.Router();

router.get('/',(req,res)=>{

    console.log('Welcome to AdminDashboard');
    
    
});




export default router