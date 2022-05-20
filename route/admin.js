
import express from "express";
import cloudinary from 'cloudinary'
import nodemailer from 'nodemailer';
import admin from "../model/admin";
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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
router.post('/checklogin',(req,res)=>{

    admin.findOne({username:req.body.username},(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else if(docs){
            const validPassword = bcrypt.compareSync(req.body.password, docs.password);

            if(validPassword){
                jwt.sign({admin:docs},'secretkey',(err,token)=>{
                    res.json({
                        token,
                        docs,
                        'status':true
                    }),
                   "Stack",{
                       expiresIn:"1h"
                   }
                })
               
            }
            
        }
    })
    
    
});

router.post('/onboard/new',(req,res)=>{

    admin.findOne({username:req.body.username},async (err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
            res.status(400).send('Username Already Exist');
        }
        else if(!docs){
            let password = randomUUID();
            const salt =  bcrypt.genSaltSync(10);
            let createAdmin =   await admin.create({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                username:req.body.username,
                password:bcrypt.hashSync(password, salt),
            });

            if(createAdmin){
                await SendPasswordMail(password);
            }
            else{
                res.status(400).send('Admin Creation was Unsuccessful..Contact Dev Team')
            }


        }
    })
    
    
});

async function SendPasswordMail(passwordStr){
    
    const mailData = {
        from: 'hello@jupitapp.co',  // sender address
        to: req.body.email,   // list of receivers
        subject: 'Onboarding@jupitapp.co <One Time Password>',
        text: 'That was easy!',
        html: `
                <div style="width:100%;height:100vh;background-color:#f5f5f5; display:flex;justify-content:center;align-items:center">
                    <div style="width:100%; height:70%;background-color:#fff;border-bottom-left-radius:15px;border-bottom-right-radius:15px;">
                        <hr style="width:100%;height:5px;background-color:#1c1c93"/>
                        <div style="width:100%;text-align:center">
                                <img src="<img src="https://res.cloudinary.com/jupit/image/upload/v1648472935/ocry642pieozdbopltnx.png" />
                        </div>   
                        <div style="width:100%;text-align:center;margin-top:20px">
                            <h2 style="font-family:candara">DEFAULT PASSWORD  </h2>
                        <div>   
                        <div style="width:100%;padding-left:20px;text-align:center;padding-top:10px">
                            <hr style="background-color:#f5f5f5;width:95%"/>
                        <div>
                            <div style="width:100%; text-align:center">
                                <p style="font-family:candara;padding:10px;font-size:16px">Dear Admin,<br/> Congratulations on the creation of your administrative account on the jupit platform.</p>
                                <p style="font-family:candara;padding:10px;font-size:16px>Kindly find below your One Time Password, which should be change upon your successful login to your dashboard.</p>
                                <p style="font-family:candara;padding:10px;font-size:20px"><b>${passwordStr}</b><p>
                                <p style="font-family:candara;font-weight:bold;margin-top:5px;font-size:16px">If you did not make this request, then ignore the email</p>
                               
                            </div>
                    
                        </div>
                        </div>

                        <div >
                        <p style="color:#9DA8B6">If you have any questions, please contact support@jupitapp.co</p>
                        </div>
                    </div>
        
                </div>
            `
      };

    transporter.sendMail(mailData, function (err, info) {
        if(err){
            console.log(err);
            res.send({"message":"An Error Occurred","callback":err})
        }
        
        else{
            
            res.send({"message":"Admin Creation was Successful..OTP has been sent to the registered Email","callback":info,"status":true})
            
        }
          
     });

}




export default router