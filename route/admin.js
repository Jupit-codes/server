
import express from "express";
import cloudinary from 'cloudinary'
import nodemailer from 'nodemailer';
import admin from "../model/admin.js";
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Usermodel from '../model/users.js'
import twoFactor from "../model/twoFactor.js";
import kyc from "../model/kyc.js";
import bank from "../model/bank.js";
import rate from "../model/rate.js";
import wallet_transactions from "../model/wallet_transactions.js";
import idcardverification from "../model/idcardverification.js";
import giftcardImages from '../model/giftcardImages.js'
import axios from "axios";
import giftcardtransactions from "../model/giftcardtransactions.js"
import NodeDateTime from 'node-datetime';
import moment from "moment";
import Logger from '../model/logger.js'
import buy_n_sell from "../model/buy_n_sell.js";
import withdrawal from "../model/withdrawal.js";
import deposit_webhook from "../model/deposit_webhook.js";
import giftCardnew from "../model/giftCardnew.js";
import notification from "../model/notification.js";
import adminroles from "../model/adminroles.js";
import cryptoledger from "../model/cryptoledger.js";
import fiatledger from "../model/fiatledger.js";

  const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtppro.zoho.com",
       auth: {
            user:'hello@jupitapp.co',
            pass:'xW1hyG7CDGhm'
            // pass:'ii84NsMqT9Xv'
         },
    secure: true,
    });

const router = express.Router();

router.get('/',(req,res)=>{

    console.log('Welcome to AdminDashboard');
    
    
});
router.post('/checklogin',(req,res)=>{


    admin.findOne({username:req.body.username},async (err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else if(docs){
           
            if(docs.status !="active"){
                res.status(400).send('User Account Blocked..Contact Administrator');
                return false
            }

            const validPassword = bcrypt.compareSync(req.body.password, docs.password);

            if(validPassword){


                    var dt = NodeDateTime.create();
                    var formatted = dt.format('Y-m-d H:M:S');
                    var reauth_time = ""

                    var currentDate = new Date();
                    var futureDate = new Date(currentDate.getTime() + 20*60000);
                    
                    // res.send({
                    //     "0":currentDate.getTime() +20*60000,
                    //     "1":currentDate ,
                    //     "2":futureDate,
                    //     "3":new Date(currentDate.getTime()),
                    //     "4":moment(futureDate).format("h:m:s"),
                    //     "5":moment(currentDate).format("h:m:s")
                    // })

                    // return false;

                    // const x = currentDate.getTime() +20*60000;
                    const x = new Date().getTime() + 20*60000;
                    // res.json({
                    //     "x":x
                    // })
                    // return false
    
                    let updateAdminLogin = await admin.findOneAndUpdate({_id:docs._id},{$set:{'loginTime':formatted,'reauthorization':x}})
                    
                    if(updateAdminLogin){
                       // console.log('updateAdmin',updateAdminLogin)
                        admin.findOne({_id:docs._id},(err,document)=>{
                            if(err){
                                res.status(400).send({
                                    "message":err
                                })
                            }
                            else if(document){
                                let statuskey="";
                                if(document.roleid === 1){
                                    statuskey = "successful";
                                }
                                else{
                                    statuskey = "pending"
                                }
                                console.log(document._id)
                                Logger.findOne({userid:document._id},(err,docx)=>{
                                    if(err){
                                        res.status(400).send(err);
                                    }
                                    else if(docx){
                                        if(docx.status === "pending"){
                                            Logger.findOneAndUpdate({_id:docx._id},{$set:{time:x}},(err,doce)=>{
                                                if(err){
                                                    res.status(400).send(err);
                                                }
                                            })
                                        }
                                        else if(docx.status === "approved"){
                                            Logger.create({
                                                userid:document._id,
                                                username:document.username,
                                                roleid:document.roleid,
                                                status:statuskey,
                                                time:x
                                            })
                                        }
                                        else if(docx.status === "disapproved"){
                                            Logger.create({
                                                userid:document._id,
                                                username:document.username,
                                                roleid:document.roleid,
                                                status:statuskey,
                                                time:x
                                            })
                                        }

                                    }
                                    else if(!docx){
                                        Logger.create({
                                            userid:document._id,
                                            username:document.username,
                                            roleid:document.roleid,
                                            status:statuskey,
                                            time:x
                                        })

                                    }
                                })
                                   
                                  
                                jwt.sign({admin:document},'secretkey',{expiresIn:1200},(err,token)=>{
                                    res.json({
                                        token,
                                        document,
                                        'status':true
                                    }),
                                   "Stack",{
                                       expiresIn:"1h"
                                   }
                                })
                            }
                        })
                    }
                    else{
                        res.status(400).send({"message":'Internal Server Error',"status":false});
                    }
                  
                  
               
            }
            else{
                res.status(400).send('Invalid Password');
            }
            
        }
        else if(!docs){
            res.status(400).send('Invalid Username');
        }
    })
    
    
});

router.post('/onboard/new',(req,res)=>{
    let random = Math.floor(Math.random() * 899999 + 100000);
    admin.findOne({username:req.body.username},async (err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
            res.status(400).send('Username Already Exist');
        }
        else if(!docs){
            admin.findOne({email:req.body.email},async (err,docs)=>{
                if(err){
                    res.status(400).send(err);
                }
                else if(docs){
                    res.status(400).send('Email Already Exist');
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
                        role:'Super Admin',
                        roleid:1,
                        status:'active'
                    });
                    if(createAdmin){
                        admin.findOneAndUpdate({_id:createAdmin._id},{$push:{
                            previledge:"All"
                       }},(err,docs)=>{
                           if(err){
                               res.send(err);
                           }
                           
                       })
                    }

                   
        
                    if(createAdmin){
                        // await SendPasswordMail(password,req.body.email);
                        const mailData = {
                            from: 'Jupit<hello@jupitapp.co>',  // sender address
                            to: req.body.email,   // list of receivers
                            subject: 'Onboarding@jupitapp.co <One Time Password>',
                            text: 'That was easy!',
                            html: `
                            <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                            
                            <head>
                              <!--[if gte mso 9]>
                            <xml>
                              <o:OfficeDocumentSettings>
                                <o:AllowPNG/>
                                <o:PixelsPerInch>96</o:PixelsPerInch>
                              </o:OfficeDocumentSettings>
                            </xml>
                            <![endif]-->
                              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <meta name="x-apple-disable-message-reformatting">
                              <!--[if !mso]><!-->
                              <meta http-equiv="X-UA-Compatible" content="IE=edge">
                              <!--<![endif]-->
                              <title></title>
                            
                              <style type="text/css">
                                @media only screen and (min-width: 570px) {
                                  .u-row {
                                    width: 550px !important;
                                  }
                                  .u-row .u-col {
                                    vertical-align: top;
                                  }
                                  .u-row .u-col-100 {
                                    width: 550px !important;
                                  }
                                }
                                
                                @media (max-width: 570px) {
                                  .u-row-container {
                                    max-width: 100% !important;
                                    padding-left: 0px !important;
                                    padding-right: 0px !important;
                                  }
                                  .u-row .u-col {
                                    min-width: 320px !important;
                                    max-width: 100% !important;
                                    display: block !important;
                                  }
                                  .u-row {
                                    width: calc(100% - 40px) !important;
                                  }
                                  .u-col {
                                    width: 100% !important;
                                  }
                                  .u-col>div {
                                    margin: 0 auto;
                                  }
                                }
                                
                                body {
                                  margin: 0;
                                  padding: 0;
                                }
                                
                                table,
                                tr,
                                td {
                                  vertical-align: top;
                                  border-collapse: collapse;
                                }
                                
                                p {
                                  margin: 0;
                                }
                                
                                .ie-container table,
                                .mso-container table {
                                  table-layout: fixed;
                                }
                                
                                * {
                                  line-height: inherit;
                                }
                                
                                a[x-apple-data-detectors='true'] {
                                  color: inherit !important;
                                  text-decoration: none !important;
                                }
                                
                                table,
                                td {
                                  color: #000000;
                                }
                                
                                a {
                                  color: #0000ee;
                                  text-decoration: underline;
                                }
                                
                                @media (max-width: 480px) {
                                  #u_content_image_4 .v-src-width {
                                    width: auto !important;
                                  }
                                  #u_content_image_4 .v-src-max-width {
                                    max-width: 80% !important;
                                  }
                                }
                              </style>
                            
                            
                            
                              <!--[if !mso]><!-->
                              <link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
                              <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet" type="text/css">
                              <!--<![endif]-->
                            
                            </head>
                            
                            <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
                              <!--[if IE]><div class="ie-container"><![endif]-->
                              <!--[if mso]><div class="mso-container"><![endif]-->
                              <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
                            
                            
                                      <div class="u-row-container" style="padding: 0px;background-color: transparent">
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                                          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #ffffff;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
                                              <div style="width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                  <!--<![endif]-->
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                              <td style="padding-right: 0px;padding-left: 0px;" align="center">
                            
                                                                <img align="center" border="0" src="https://images.unlayer.com/projects/89020/1657367336441-895948.png" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 205px;"
                                                                  width="205" class="v-src-width v-src-max-width" />
                            
                                                              </td>
                                                            </tr>
                                                          </table>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <!--[if (!mso)&(!IE)]><!-->
                                                </div>
                                                <!--<![endif]-->
                                              </div>
                                            </div>
                                            <!--[if (mso)|(IE)]></td><![endif]-->
                                            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                          </div>
                                        </div>
                                      </div>
                            
                            
                            
                                      <div class="u-row-container" style="padding: 0px;background-color: transparent">
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                                          <div style="border-collapse: collapse;display: table;width: 100%;background-image: url('https://cdn.templates.unlayer.com/assets/1636376675254-sdsdsd.png');background-repeat: no-repeat;background-position: center top;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-image: url('https://cdn.templates.unlayer.com/assets/1636376675254-sdsdsd.png');background-repeat: no-repeat;background-position: center top;background-color: transparent;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
                                              <div style="width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                                  <!--<![endif]-->
                            
                                                  <table id="u_content_image_4" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:50px 10px 25px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                              <td style="padding-right: 0px;padding-left: 0px;" align="center">
                            
                                                                <img align="center" border="0" src="https://cdn.templates.unlayer.com/assets/1636374086763-hero.png" alt="Hero Image" title="Hero Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 54%;max-width: 286.2px;"
                                                                  width="286.2" class="v-src-width v-src-max-width" />
                            
                                                              </td>
                                                            </tr>
                                                          </table>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                  <tbody>
                                                    <tr>
                                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 10px;font-family:arial,helvetica,sans-serif;" align="left">
                          
                                                        <div style="color: #a7a5a5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                          <p style="font-size: 14px; line-height: 140%;"><strong><span style="font-family: Lato, sans-serif; font-size: 14px; line-height: 19.6px;">Dear SUPER ADMIN,</span></strong></p>
                                                        </div>
                          
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 20px 5px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <h2 style="margin: 0px; color: #141414; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: 'Open Sans',sans-serif; font-size: 28px;">
                                                            <strong>Here Is Your One Time Password</strong>
                                                          </h2>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:15px 10px 12px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <h1 style="margin: 0px; color: #3b4d63; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 41px;">
                                                            <strong><span style="text-decoration: underline;">${password}</span></strong>
                                                          </h1>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 117px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <div style="color: #1c1c93; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 18px; line-height: 25.2px;"><strong><span style="font-family: Lato, sans-serif; line-height: 25.2px; font-size: 18px;">Valid For 15 minutes Only!</span></strong>
                                                              </span>
                                                            </p>
                                                          </div>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <!--[if (!mso)&(!IE)]><!-->
                                                </div>
                                                <!--<![endif]-->
                                              </div>
                                            </div>
                                            <!--[if (mso)|(IE)]></td><![endif]-->
                                            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                          </div>
                                        </div>
                                      </div>
                            
                            
                            
                                      <div class="u-row-container" style="padding: 0px;background-color: transparent">
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #000000;">
                                          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #000000;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
                                              <div style="width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                                  <!--<![endif]-->
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="83%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #443e3e;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                            <tbody>
                                                              <tr style="vertical-align: top">
                                                                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                  <span>&#160;</span>
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          </table>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <div align="center">
                                                            <div style="display: table; max-width:44px;">
                                                              <!--[if (mso)|(IE)]><table width="44" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:44px;"><tr><![endif]-->
                            
                            
                                                              <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                                              <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                                                <tbody>
                                                                  <tr style="vertical-align: top">
                                                                    <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                                      <a href="https://instagram.com/" title="Instagram" target="_blank">
                                                                        <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                                      </a>
                                                                    </td>
                                                                  </tr>
                                                                </tbody>
                                                              </table>
                                                              <!--[if (mso)|(IE)]></td><![endif]-->
                            
                            
                                                              <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                                            </div>
                                                          </div>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="83%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #443e3e;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                            <tbody>
                                                              <tr style="vertical-align: top">
                                                                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                  <span>&#160;</span>
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          </table>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 20px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <div style="color: #a3b2c3; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 140%;">Jupitapp</p>
                                                          </div>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <!--[if (!mso)&(!IE)]><!-->
                                                </div>
                                                <!--<![endif]-->
                                              </div>
                                            </div>
                                            <!--[if (mso)|(IE)]></td><![endif]-->
                                            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                          </div>
                                        </div>
                                      </div>
                            
                            
                                      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <!--[if mso]></div><![endif]-->
                              <!--[if IE]></div><![endif]-->
                            </body>
                            
                            </html>
                                `
                          };
                    
                        transporter.sendMail(mailData, function (err, info) {
                            if(err){
                                console.log(err);
                                // res.status(400).send(err)
                                res.status(400).send({"message":"An Error Occurred","callback":err})
                            }
                            
                            else{
                                
                                res.send({"message":"Admin Creation was Successful..OTP has been sent to the registered Email","callback":info,"status":true})
                                
                            }
                              
                         });
                    }
                    else{
                        res.status(400).send('Admin Creation was Unsuccessful..Contact Dev Team')
                    }
                }
            })

        }
    })
    
    
});

router.get('/get/all/users',(req,res)=>{
    
    Usermodel.find({},(err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            res.send({
                "message":docs,
                "status":true
            })
        }
        else if(!docs){
            res.status(400).send({
                "message":"No User Found",
                "status":false
            })
        }
    })
})


router.post('/handle/staff/login',middlewareVerify,(req,res)=>{
   
    Logger.findOneAndUpdate({_id:req.body.id},{$set:{status:req.body.status}},(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else if(docs){
            res.send(docs)
        }

    })
})




async function parseJwt(token){
    try {
        return  JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        return null;
      }
  }




async function middlewareVerify(req,res,next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader === "undefined" || bearerHeader === ""){
       return  res.status(403).send('Forbidden Request');
        
    }
    else{
       
        let decodedJwt = await parseJwt(bearerHeader);
      
        if(!decodedJwt){
            return res.status(403).send({"message":"Forbidden Request."});
            
        }
        if(decodedJwt){
            const expiration = new Date(decodedJwt.exp * 1000);
            const now = new Date();
            const Oneminute = 1000 * 60 * 1;
            if( expiration.getTime() - now.getTime() < Oneminute ){
                return res.sendStatus(403).send('Token Expired');
                
            }
        }
        
        admin.findOne({email:decodedJwt.admin.email},(err,docs)=>{
           if(err){
              return  res.status(403).send({"message":"Internal Server Error"});
            
           } 
           else if(docs){
                if(docs.password != decodedJwt.admin.password ){
                    return res.status(403).send("Password Expired");
                    
                }
                if(docs.status != "active"){
                   return res.status(403).send("Account Blocked");
                    
                }
           }
           else if(!docs){
               return  res.status(403).send({"message":"Internal Server Error"});
                
           }
        })

        req.token = bearerHeader;
        next();
        
        
        
    }
}

router.post('/get/all/users/id', async(req,res)=>{

    let userdetails = await fetchUserDetails(req.body.id);
    
    
    if(userdetails){
        let gettwofactor = await fetchtwofactor(req.body.id);
        let getkyc = await fetchkyc(req.body.id);
        let getbank = await fetchbank(userdetails.email);
        let rate = await fetchrate();

        res.send({
            "status":true,
            "detail":userdetails,
            "twofactor":gettwofactor,
            "kyc":getkyc,
            "bank":getbank,
            "rate":rate
            
        })
    }
    else{
        res.status(400).send({"message":"Invalid Request"})
    }

})


router.post('/get/all/users/account', async(req,res)=>{

    let userdetails = await fetchAccountDetails(req.body.account);

    console.log(req.body.acount);

    if(userdetails){
        let gettwofactor = await fetchtwofactor(userdetails._id);
        let getkyc = await fetchkyc(userdetails._id);
        let getbank = await fetchbank(userdetails.email);
        let rate = await fetchrate();

        res.send({
            "status":true,
            "detail":userdetails,
            "twofactor":gettwofactor,
            "kyc":getkyc,
            "bank":getbank,
            "rate":rate
            
        })
    }
    else{
        res.status(400).send({"message":"Invalid Request"})
    }

})


async function fetchAccountDetails(account){
    let result =  Usermodel.findOne({virtual_account:account},async(err,docs)=>{
         if(err){
             // res.status(400).send({"message":err})
             console.log(err)
             return [err,false]
         }
         else if(docs){
             // res.json(docs)
             console.log(docs)
             return [docs,true]
         }
         else if(!docs){
             // res.status(400).send({"message":"Invalid Request"});
             return ["Invalid Request",false]
         }
     
     }).clone().catch(function(err){ console.log(err)});
 
     return result;
 
     
 }



async function fetchUserDetails(userid){
   let result =  Usermodel.findOne({_id:userid},async(err,docs)=>{
        if(err){
            // res.status(400).send({"message":err})
            console.log(err)
            return [err,false]
        }
        else if(docs){
            // res.json(docs)
            console.log(docs)
            return [docs,true]
        }
        else if(!docs){
            // res.status(400).send({"message":"Invalid Request"});
            return ["Invalid Request",false]
        }
    
    }).clone().catch(function(err){ console.log(err)});

    return result;

    
}

async function fetchrate (){
    let result = await rate.find({},(err,docs)=>{
        if(err){
            return [err,false]
        }
        else{
            return [docs,true]
        }
    }).clone().catch(function(err){ console.log(err)});
    return result;
}

async function fetchtwofactor(userid){
    let result = await twoFactor.findOne({userid:userid},(err,docs)=>{
        if(err){
            // res.status(400).send({"message":err})
            return [err,false]
        }
        else if(docs){
            // res.json(docs)
            return [docs,true]
        }
        else if(!docs){
            // res.status(400).send({"message":"Invalid Request"});
            return ["Not Activated",false]
        }
    }).clone().catch(function(err){ console.log(err)});

    return result;
}

async function fetchkyc(userid){
    let result = await kyc.findOne({userid:userid},(err,docs)=>{
        if(err){
            // res.status(400).send({"message":err})
            return [err,false]
        }
        else if(docs){
            // res.json(docs)
            return [docs,true]
        }
        else if(!docs){
            // res.status(400).send({"message":"Invalid Request"});
            return ["KYC Error",false]
        }
    }).clone().catch(function(err){ console.log(err)});

    return result;
}


async function fetchbank(email){
    let result = await bank.findOne({email:email},(err,docs)=>{
        if(err){
            // res.status(400).send({"message":err})
            return [err,false]
        }
        else if(docs){
            // res.json(docs)
            return [docs,true]
        }
        else if(!docs){
            // res.status(400).send({"message":"Invalid Request"});
            return ["KYC Error",false]
        }
    }).clone().catch(function(err){ console.log(err)});

    return result;
}

router.post('/manual/wallet/credit',async (req,res)=>{
   
    if(req.body.modalTitle === "BTC Wallet Balance"){
       
        if(req.body.mode === "Deposit"){


            let AddFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'btc_wallet.0.balance':parseFloat(req.body.valuex).toFixed(8)}}).exec();
    
            if(AddFund){
    
                await Usermodel.findOne({_id:req.body.userid},async (err,docs)=>{
                        if(err){
                            res.status(400).send('Inter Server Error')
                        }
                        else if(docs){
                            await wallet_transactions.create({
                                type:'Buy',
                                serial:req.body.userid,
                                order_id:req.body.userid,
                                currency:"BTC",
                                amount:req.body.valuex,
                                from_address:randomUUID(),
                                fees:"0",
                                to_address:docs.btc_wallet[0].address,
                                wallet_id:req.body.userid,
                                usdvalue:req.body.usdvaluex,
                                nairavalue:req.body.nairavaluex,
                                marketprice:req.body.marketrate,
                                rateInnaira:req.body.jupitrate,
                                status:'Transaction Completed' 
                            })
                            let saveStatus =  await notification.create({
                                type:5,
                                orderid:docs._id,
                                transfertype:'Buy',
                                asset:"BTC",
                                from_address:req.body.nairavaluex,
                                to_address:docs.btc_wallet[0].address,
                                status:'Completed',
                                read:'unread',
                                date_created:new Date(),
                                initiator:req.body.valuex,
                        
                            })
                            res.send({
                                "message":"Wallet Successfully Updated",
                                "status":true
                            })
                        }
                        else if(!docs){
                            res.send({
                                "message":"Wallet Commit Not Completed",
                                "status":false
                            })
                        }
                }).clone().catch(function(err){ return [err,false]});
               
            }
            else{
                res.send({
                    "message":"Wallet Update Error",
                    "status":false
                })
            }

        }
        else if(req.body.mode === "Withdrawal"){
            let SubFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'btc_wallet.0.balance':- parseFloat(req.body.valuex).toFixed(8)}}).exec();
    
            if(SubFund){
    
                await Usermodel.findOne({_id:req.body.userid},async (err,docs)=>{
                        if(err){
                            res.status(400).send('Internal Server Error')
                        }
                        else if(docs){
                            await wallet_transactions.create({
                                type:'Sell',
                                serial:req.body.userid,
                                order_id:req.body.userid,
                                currency:"BTC",
                                amount:req.body.valuex,
                                from_address:randomUUID(),
                                fees:"0",
                                to_address:docs.btc_wallet[0].address,
                                wallet_id:req.body.userid,
                                usdvalue:req.body.usdvaluex,
                                nairavalue:req.body.nairavaluex,
                                marketprice:req.body.marketrate,
                                rateInnaira:req.body.jupitrate,
                                status:'Transaction Completed' 
                            })
                            await deposit_webhook.create({
                                reference:'Manual Withdrawal',
                                account_number:docs.virtual_account,
                                amount:parseFloat(req.body.valuex).toFixed(8)
                            })
                            // let saveStatus =  await notification.create({
                            //     type:5,
                            //     orderid:docs._id,
                            //     transfertype:'Buy',
                            //     asset:"BTC",
                            //     from_address:req.body.nairavaluex,
                            //     to_address:docs.btc_wallet[0].address,
                            //     status:'Completed',
                            //     read:'unread',
                            //     date_created:new Date(),
                            //     initiator:req.body.valuex,
                        
                            // })
                            res.send({
                                "message":"Wallet Successfully Updated",
                                "status":true
                            })
                        }
                        else if(!docs){
                            res.send({
                                "message":"Wallet Commit Not Completed",
                                "status":false
                            })
                        }
                }).clone().catch(function(err){ return [err,false]});
               
            }
            else{
                res.send({
                    "message":"Wallet Update Error",
                    "status":false
                })
            }
        }
        
    
    }
    else if(req.body.modalTitle === "USDT Wallet Balance"){
        
        if(req.body.mode === "Deposit"){
            let AddFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'usdt_wallet.0.balance':parseFloat(req.body.valuex).toFixed(6)}}).exec();
            if(AddFund){
                await Usermodel.findOne({_id:req.body.userid},async (err,docs)=>{
                    if(err){
                        res.status(400).send('Inter Server Error')
                    }
                    else if(docs){
                        await wallet_transactions.create({
                            type:'Buy',
                            serial:req.body.userid,
                            order_id:req.body.userid,
                            currency:"USDT",
                            amount:req.body.valuex,
                            from_address:randomUUID(),
                            fees:"0",
                            to_address:docs.usdt_wallet[0].address,
                            wallet_id:req.body.userid,
                            usdvalue:req.body.usdvaluex,
                            nairavalue:req.body.nairavaluex,
                            marketprice:req.body.marketrate,
                            rateInnaira:req.body.jupitrate,
                            status:'Transaction Completed' 
                        })
                        let saveStatus =  await notification.create({
                            type:5,
                            orderid:docs._id,
                            transfertype:'Buy',
                            asset:"USDT",
                            from_address:req.body.nairavaluex,
                            to_address:docs.usdt_wallet[0].address,
                            status:'Completed',
                            read:'unread',
                            date_created:new Date(),
                            initiator:req.body.valuex,
                    
                        })
                        
                        res.send({
                            "message":"Wallet Successfully Updated",
                            "status":true
                        })
                    }
                    else if(!docs){
                        res.send({
                            "message":"Wallet Commit Not Completed",
                            "status":false
                        })
                    }
            }).clone().catch(function(err){ return [err,false]});
           
    
            
            }
            else{
                res.send({
                    "message":"Wallet Update Error",
                    "status":false
                })
            }
        }
        else if(req.body.mode === "Withdrawal"){
            let SubFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'usdt_wallet.0.balance':- parseFloat(req.body.valuex).toFixed(6)}}).exec();
            if(SubFund){
                await Usermodel.findOne({_id:req.body.userid},async (err,docs)=>{
                    if(err){
                        res.status(400).send('Inter Server Error')
                    }
                    else if(docs){
                        await wallet_transactions.create({
                            type:'Sell',
                            serial:req.body.userid,
                            order_id:req.body.userid,
                            currency:"USDT",
                            amount:req.body.valuex,
                            from_address:randomUUID(),
                            fees:"0",
                            to_address:docs.usdt_wallet[0].address,
                            wallet_id:req.body.userid,
                            usdvalue:req.body.usdvaluex,
                            nairavalue:req.body.nairavaluex,
                            marketprice:req.body.marketrate,
                            rateInnaira:req.body.jupitrate,
                            status:'Transaction Completed' 
                        })
                        await deposit_webhook.create({
                            reference:'Manual Withdrawal',
                            account_number:docs.virtual_account,
                            amount:parseFloat(req.body.valuex).toFixed(8)
                        })
                        // let saveStatus =  await notification.create({
                        //     type:5,
                        //     orderid:docs._id,
                        //     transfertype:'Buy',
                        //     asset:"USDT",
                        //     from_address:req.body.nairavaluex,
                        //     to_address:docs.usdt_wallet[0].address,
                        //     status:'Completed',
                        //     read:'unread',
                        //     date_created:new Date(),
                        //     initiator:req.body.valuex,
                    
                        // })
                        res.send({
                            "message":"Wallet Successfully Updated",
                            "status":true
                        })
                    }
                    else if(!docs){
                        res.send({
                            "message":"Wallet Commit Not Completed",
                            "status":false
                        })
                    }
            }).clone().catch(function(err){ return [err,false]});
           
    
            
            }
            else{
                res.send({
                    "message":"Wallet Update Error",
                    "status":false
                })
            }
        }
        

       
    
    }
    else if(req.body.modalTitle === "Naira Wallet Balance"){

        if(req.body.mode === "Deposit"){
            let AddFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'naira_wallet.0.balance':parseFloat(req.body.valuex)}}).exec();
            if(AddFund){
    
                Usermodel.findOne({_id:req.body.userid},async (err,docs)=>{
                    if(err){
                        res.status(400).send(err)
                    }
                    else if(docs){
                        await deposit_webhook.create({
                            reference:'Manual Deposit',
                            account_number:docs.virtual_account,
                            amount:parseFloat(req.body.valuex).toFixed(8)
                        })
                        res.send({
                            "message":"Wallet Successfully Updated",
                            "status":true
                        })
                    }
                    else{
                        res.send({
                            "message":"Commit Not Completed",
                            "status":false
                        })
                    }
                }).clone().catch(function(err){ return [err,false]});
               
            }
            else{
                res.send({
                    "message":"Wallet Update Error",
                    "status":false
                })
            }
        
        }
        else if(req.body.mode === "Withdrawal"){
            let SubFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'naira_wallet.0.balance':- parseFloat(req.body.valuex)}}).exec();
            if(SubFund){
    
                Usermodel.findOne({_id:req.body.userid},async (err,docs)=>{
                    if(err){
                        res.status(400).send(err)
                    }
                    else if(docs){
                        await withdrawal.create({
                            username:docs.username,
                            userid:req.body.userid,
                            amount:req.body.valuex,
                            account_number:'00000000000',
                            account_name:'Jupit',
                            bank_code:'000',
                            email:docs.email,
                            type:'Withdrawal',
                            currency_worth:req.body.valuex
                        })
                        res.send({
                            "message":"Wallet Successfully Updated",
                            "status":true
                        })
                    }
                    else{
                        res.send({
                            "message":"Commit Not Completed",
                            "status":false
                        })
                    }
                }).clone().catch(function(err){ return [err,false]});
               
            }
            else{
                res.send({
                    "message":"Wallet Update Error",
                    "status":false
                })
            }
        
        }
     
        
    }
    
   
})

router.get('/set/rate',async(req,res)=>{
    let btc_rate=
    [
        {
            "buy":0
        },
        {
            "sell":0
        }

    ]

    let usdt_rate=
    [
        {
            "buy":0
        },
        {
            "sell":0
        }

    ]
    let giftcard_rate=
    [
        {
            "buy":0
        },
        {
            "sell":0
        }

    ]

    
    let initial = "JupitRateBard"
    let initialiseRate = await rate.create({
        initialization:initial
    })
    if (initialiseRate){
        
            btc_rate.forEach(d => {
                    
                rate.findOneAndUpdate({initialization:initial},{$push:{
                btc:d
            }},(err,docs)=>{
                if(err){
                    res.send(err);
                }
                
            })
            
        }); 
        usdt_rate.forEach(d => {
                    
                    rate.findOneAndUpdate({initialization:initial},{$push:{
                    usdt:d
                        }},(err,docs)=>{
                            if(err){
                                res.send(err);
                            }
                            
                        })
        
            }); 
        giftcard_rate.forEach(d => {
                    
            rate.findOneAndUpdate({initialization:initial},{$push:{
            giftcard:d
                }},(err,docs)=>{
                    if(err){
                        res.send(err);
                    }
                    
                })
        
        }); 

        res.send('Completed');


    }
    else{
        res.send('An Error Occurred')
    }
})

router.post('/set/rate/btc',(req,res)=>{
    let btc_sell_rate = req.body.amount
    let initial = "JupitRateBard"

    if(req.body.type === "BTC_SELL"){
        
        let x = rate.findOneAndUpdate({initialization:initial},{$set:{'btc.1.sell':req.body.btc_sell}},(err,docs)=>{
            if(err){
                res.send(err);
            }
            else{
                res.send({
                    "message":"BTC Sell Rate Successfully Saved",
                    "docs":docs
                })
            }
        })
    }

    if(req.body.type === "BTC_BUY"){
        
        let x = rate.findOneAndUpdate({initialization:initial},{$set:{'btc.0.buy':req.body.btc_buy}},(err,docs)=>{
            if(err){
                res.send(err);
            }
            else{
                res.send({
                    "message":"BTC Buy Rate Successfully Saved",
                    "docs":docs
                })
            }
        })
    }

    
})



router.post('/set/rate/usdt',(req,res)=>{
    let btc_sell_rate = req.body.amount
    let initial = "JupitRateBard"

    if(req.body.type === "USDT_SELL"){
        
        let x = rate.findOneAndUpdate({initialization:initial},{$set:{'usdt.0.sell':req.body.usdt_sell}},(err,docs)=>{
            if(err){
                res.send(err);
            }
            else{
                res.send({
                    "message":"USDT Sell Rate Successfully Saved",
                    "docs":docs
                })
            }
        })
    }

    if(req.body.type === "USDT_BUY"){
        
        let x = rate.findOneAndUpdate({initialization:initial},{$set:{'usdt.1.buy':req.body.usdt_buy}},(err,docs)=>{
            if(err){
                res.send(err);
            }
            else{
                res.send({
                    "message":"USDT Buy Rate Successfully Saved",
                    "docs":docs
                })
            }
        })
    }

    
})


router.post('/set/rate/giftcard',(req,res)=>{
    let btc_sell_rate = req.body.amount
    let initial = "JupitRateBard"

    if(req.body.type === "GIFTCARD_SELL"){
        
        giftCardnew.findOneAndUpdate({brandname:req.body.cardtype},{$set:{'sellrate':req.body.giftcard_sell}},(err,docs)=>{
            if(err){
                res.status(400).send('Internal Server Error')

            }
            else if(docs){
                res.send({
                    "message":"GIFTCARD Sell Rate Successfully Saved",
                    "docs":docs
                })
            }
        })
    }

    if(req.body.type === "GIFTCARD_BUY"){
        
        giftCardnew.findOneAndUpdate({brandname:req.body.cardtype},{$set:{'buyrate':req.body.giftcard_buy}},(err,docs)=>{
            if(err){
                res.status(400).send('Internal Server Error')

            }
            else if(docs){
                res.send({
                    "message":"GIFTCARD Buy Rate Successfully Saved",
                    "docs":docs
                })
            }
        })
    }

    
})

router.post('/set/password',(req,res)=>{

    const salt =  bcrypt.genSaltSync(10);
    let newpassword =  bcrypt.hashSync(req.body.password, salt)
     
   let x = admin.findOneAndUpdate({_id:req.body.userid},{$set:{password:newpassword,changepassword:true}},(err,docs)=>{
       if(err){
           res.status(400).send({"message":err,"status":false})
       }
       else if(docs){
           admin.findById(req.body.userid,'-password',(err,doc)=>{
               if(err){
                   res.status(400).send(err)
               }
               else{
                res.send({"message":'Password Successfully Updated',"status":true,"data":doc})
               }
           })
           
       }
       else if(!docs){
        res.status(400).send({"message":'Internal Server Error',"status":false})
       }
   })
})

router.post('/get/user/wallet/transactions',(req,res)=>{
    let x = Usermodel.findOne({_id:req.body.userid},(err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
            "status":false            })
        }
        else if(docs){
               
                let btcaddress = docs.btc_wallet[0].address;
                let usdtaddress = docs.usdt_wallet[0].address; 
                wallet_transactions.find({
                    $or:[
                            {
                                $or:[
                                    {
                                        from_address:btcaddress
                                    },
                                    {
                                        to_address:btcaddress
                                    }
                                ]
                            },
                            {
                                $or:[
                                    {
                                        from_address:usdtaddress
                                    },
                                    {
                                        to_address:usdtaddress
                                    }
                                ]
                                
                                
                            }
                        ]
                   },(err,docs)=>{
                       if(err){
                           res.status(400).send(err)
                       }
                       else if(docs){
                           res.send({
                               "message":docs,
                               "status":true
                           })
                       }
                       
                   }).sort({date_created: -1})
        }
        else if(!docs){
            res.status(400).send({
                "message":"Invalid Request",
                "status":false
            })
        }
    })
})

router.get('/get/all/transactions',(req,res)=>{
    let x = wallet_transactions.find({},(err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        else{
            res.send({
                "message":docs,
                "status":true
            })
        }
    })
})

router.post('/get/all/transactions/individual',(req,res)=>{

    Usermodel.findOne({_id:req.body.userid},async(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else if(docs){
            let address_BTC = docs.btc_wallet[0].address; 
            let address_USDT = docs.usdt_wallet[0].address; 

           await  wallet_transactions.find({

                $or:[

                    {
                        order_id:req.body.userid
                    },
                    {
                        from_address:address_BTC
                    },
                    {
                        to_address:address_BTC
                    },
                    {
                        from_address:address_USDT
                    },
                    {
                        to_address:address_USDT
                    }

                ]

            },(err,docs)=>{
                if(err){
                    res.status(400).send(err)
                }
                else if(docs){
                    res.send(docs)
                }
            }).clone().catch(function(err){ return [err,false]});
          
        }
    }).clone().catch(function(err){ return [err,false]});

   
})

router.get('/get/awaiting/approval',(req,res)=>{
    idcardverification.find({status:'Pending'},(err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            res.send({
                "message":docs,
                "status":true
            })
        }
        else if(!docs){
            res.status(400).send({
                "message":"Not Found",
                "status":false
            })
        }
    })
})

router.post('/drivers/licence/service',async (req,res)=>{
    const Driverslicense_params = 
    {
       "firstname": req.body.firstname,
       "surname": req.body.firstname,
       "phone": req.body.phone,
       "email": req.body.email,
       "frsc":req.body.frsc,
       "dob": req.body.dob,
       "callbackURL":"https://yoursite.com"
  }
   let urls = "https://app.verified.ng/sfx-verify/v2/frsc"
   

   let callback = await axios.post(urls,Driverslicense_params,{
               headers: {
                   
                   "Content-Type": "application/json",
                   "userid":"1641124470949",
                   "apiKey":"x7rCRKM0JMTAOEtGK0I5",
               }
           })
       .then(result=>{
           console.log(result)
         res.send(result)
           
       })
       .catch((err)=>{
         
           console.log('Eroor415',err.response.data)
           res.send(err.response.data)
           
       })


})

router.post('/verify/idcard',middlewareVerify, async(req,res)=>{

    idcardverification.findOne({_id:req.body._id},async (err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            const url = docs.imagepath
                const image = await axios.get(url, {responseType: 'arraybuffer'});
                const raw = Buffer.from(image.data).toString('base64');
                const base64Image = "data:" + image.headers["content-type"] + ";base64,"+raw;

                
             
                
                
            if(docs.cardtype === "VoterCard"){
                const params = {
                
                    "verificationType": "VIN-FACE-MATCH-VERIFICATION",
                    "searchParameter":docs.cardnumber,
                    "selfie":base64Image,
                    "country":"NG",
                    "selfieToDatabaseMatch":true
                };

                
                let voterCardCall = await voterscard(params);
                if(voterCardCall[1]){
                    res.send({
                        "message":voterCardCall[0],
                        "status":true
                    })
                }
                else {
                    res.status(400).send({
                        "message":voterCardCall[0],
                        "status":true
                    })

                }

            }
           
            else if(docs.cardtype === "Driverslicense"){
                // const image = await axios.get(url, {responseType: 'arraybuffer'});
                // const raw = Buffer.from(image.data).toString('base64');
                // const base64Image = "data:" + image.headers["content-type"] + ";base64,"+raw;
                 const Driverslicense_params = 
                 {
                    "firstname": "Ebong",
                    "surname": "Ibokette",
                    "phone": "08167396655",
                    "email": "ebong@company.com",
                    "frsc":"FFF11111AA76",
                    "dob": "1993-11-06",
                    "callbackURL":"https://yoursite.com"
               }
                let urls = "https://app.verified.ng/sfx-verify/v2/frsc"
                

                let callback = await axios.post(urls,Driverslicense_params,{
                            headers: {
                                
                                "Content-Type": "text/plain",
                                "userid":"1641124470949",
                                "apiKey":"x7rCRKM0JMTAOEtGK0I5",
                            }
                        })
                    .then(result=>{
                        console.log(result)
                      res.send(result)
                        
                    })
                    .catch((err)=>{
                      
                        console.log('Eroor415',err.response.data)
                        res.send(err.response.data)
                        
                    })
            

                      
            }
            else if(docs.cardtype === "Intlpassport"){
                console.log(docs.cardtype)
                const params_intlpassport = 
                //     {
                //         "searchParameter": docs.cardnumber,
                //         "lastName": docs.lastname,
                //         "firstName": docs.firstname,
                //         "dob": docs.dob,
                //         "gender": "Male",
                //         "selfie": base64Image,
                //         "phone": "07033300011",
                //         "email": "hhhh@gmail.com",
                //         "verificationType": "PASSPORT-FACE-MATCH-VERIFICATION",
                //         "selfieToDatabaseMatch": "True"
                //    }
                {
                    "transactionReference": "",
                    "searchParameter": docs.cardnumber,
                    // "searchParameter": "A07011111",
                    "firstName": docs.firstname,
                    "lastName": docs.lastname,
                    "gender": "Male",
                    "dob": docs.dob,
                    "verificationType": "PASSPORT-FACE-MATCH-VERIFICATION",
                     "email":"johndoe@email.com",
                     "phone": "07030000000",  
                    "selfie": base64Image,
                    "selfieToDatabaseMatch":"true"
                  }
                    let IntlpassportCardCall = await InternationalPassport(params_intlpassport);
                    if(IntlpassportCardCall[1]){
                        res.send({
                            "message":IntlpassportCardCall[0],
                            "status":true
                        })
                    }
                    else {
                        res.status(400).send({
                            "message":IntlpassportCardCall[0].data,
                            "status":false
                        })

                }
            }
                
        }
    })
    
    
    // res.json({
    //     "message":base64Image,
    //     "status":true
    // })
})


async function voterscard(params){
    let urls = "https://api.verified.africa/sfx-verify/v3/id-service"
    

    let callback = await axios.post(urls,params,{
                headers: {
                    "Content-Type": "application/json",
                    "userid":"1641124470949",
                    "apiKey":"57tATVQShl9ZhLMxQ8FM",
                }
            })
        .then(result=>{
            // console.log(result.data)
            // res.send({
            //     "message":result.data,
            //     "status":true
            // })
            return [result.data,true]
            
        })
        .catch((err)=>{
            // console.log(err.response)
            // res.status(400).send({
            //     "message":err.response,
            //     "status":false
            // })
            return [err.response,false]
            
        })

    return callback;
}


async function InternationalPassport(params){
    let urls = "https://api.verified.africa/sfx-verify/v3/id-service"
    

    let callback = await axios.post(urls,params,{
                headers: {
                    "Content-Type": "application/json",
                    "userid":"1641124470949",
                    "apiKey":"CPPLHMd6uQ5D4AhoWVMF",
                }
            })
        .then(result=>{
            console.log(result.data)
            // res.send({
            //     "message":result.data,
            //     "status":true
            // })
            return [result.data,true]
            
        })
        .catch((err)=>{
            console.log(err.response)
            // res.status(400).send({
            //     "message":err.response,
            //     "status":false
            // })
            return [err.response,false]
            
        })

    return callback;
}

async function DriverL(Driverslicense_params){
    let urls = "https://app.verified.ng/id-service/frsc"
    

    let callback = await axios.post(urls,Driverslicense_params,{
                headers: {
                    "Content-Type": "application/json",
                    "userid":"1641124470949",
                    "apiKey":"CPPLHMd6uQ5D4AhoWVMF",
                }
            })
        .then(result=>{
           
           return [result.data,true]
            
        })
        .catch((err)=>{
          
            return [err.response,false]
            
        })

    return callback;
}


router.get('/fetch/giftcard/sell',(req,res)=>{
    giftcardtransactions.find({$and:[{status:'untreated'},{type:'Sell'}]},(err,docs)=>{
        if(err){
            res.send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            res.send({
                "message":docs,
                "status":true
            })
        }
    })
})


router.get('/fetch/giftcard/buy',(req,res)=>{
    giftcardtransactions.find({$and:[{status:'untreated'},{type:'Buy'}]},(err,docs)=>{
        if(err){
            res.send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            res.send({
                "message":docs,
                "status":true
            })
        }
    })
})


router.post('/get/uploadedgiftcards',(req,res)=>{
    giftcardImages.find({unique_id:req.body.id},(err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            giftcardtransactions.find({unique_id:req.body.id},(err,docs_gift)=>{
                if(err){
                    res.status(400).send({
                        "message":err
                    })
                }
                else if(docs_gift){
                    // console.log(docs_gift[0].userid)
                    Usermodel.findOne({_id:docs_gift[0].userid},(err,docs_user)=>{
                        if(err){
                            res.status(400).send({
                                "message":err
                            }) 
                        }
                        else if(docs_user){
                            bank.findOne({email:docs_user.email},(err,docs_bank)=>{
                                if(err){
                                    res.status(400).send({
                                        "message":err
                                    }) 
                                }else if(docs_bank){
                                    res.send({
                                        "message":docs,
                                        "message_details":docs_gift,
                                        "message_bank":docs_bank,
                                        "status":true
                                    })
                                } 
                                else if(!docs_bank){
                                    res.status(400).send({
                                        "message":"Internal Server Error Bank"
                                    }) 
                                }
                            })
                        }
                        else if(!docs_user){
                            res.status(400).send({
                                "message":"Internal Server Error User"
                            }) 
                        }
                    })
                   
                }
                else if(!docs){
                    res.status(400).send({
                        "message":"Internal Server Error"
                    })
                }
            })

            
        }
        else if(!docs){
            res.status(400).send({
                "message":"Empty",
                "status":false
            })
        }
       
    })
})



router.post('/get/uploadedgiftcards/buy',(req,res)=>{
    giftcardtransactions.findOne({_id:req.body.id},(err,docs_gift)=>{
        if(err){
            res.status(400).send({
                "message":err
            })
        }
        else if(docs_gift){
            
            Usermodel.findOne({_id:docs_gift.userid},(err,docs_user)=>{
                if(err){
                    res.status(400).send({
                        "message":err
                    }) 
                }
                else if(docs_user){
                    
                    bank.findOne({email:docs_user.email},(err,docs_bank)=>{
                        if(err){
                            res.status(400).send({
                                "message":err
                            }) 
                        }else if(docs_bank){
                            res.send({
                               
                                "message_details":docs_gift,
                                "message_bank":docs_bank,
                                "status":true
                            })
                        } 
                        else if(!docs_bank){
                            res.status(400).send({
                                "message":"Internal Server Error Bank"
                            }) 
                        }
                    })
                }
                else if(!docs_user){
                    res.status(400).send({
                        "message":"Internal Server Error User"
                    }) 
                }
            })
           
        }
        else if(!docs){
            res.status(400).send({
                "message":"Internal Server Error"
            })
        }
    })
})

router.post('/giftcard/markhastreated',async(req,res)=>{
    await giftcardtransactions.findOneAndUpdate({unique_id:req.body.id},{$set:{status:'treated'}},async (err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            await giftcardImages.updateMany({unique_id:req.body.id},{$set:{status:'treated'}},(err,docs)=>{
                if(err){
                    res.status(400).send({
                        "message":err,
                        "status":false
                    })
                }
                else if(docs){
                    res.send({
                        "message":"Update was Successful",
                        "status":true
                    })
                }
            }).clone().catch(function(err){ console.log(err)});
        }
    }).clone().catch(function(err){ console.log(err)});
})

router.get('/all/admin',(req,res)=>{
    admin.find({},'-password',(err,docs)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send(docs)
        }
    })
})
router.get('/all/staff',(req,res)=>{
    admin.find({},(err,docs)=>{
        if(err){
            res.send(err);
            return false
        }
        else{
            res.send(docs);
            return true;
        }
    })
})


router.post('/staff/creation',(req,res)=>{

    admin.findOne({username:req.body.username},async (err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
            res.status(400).send('Username Already Exist');
        }
        else if(!docs){
            admin.findOne({email:req.body.email},async (err,docs)=>{
                if(err){
                    res.status(400).send(err);
                }
                else if(docs){
                    res.status(400).send('Email Already Exist');
                }
                else if(!docs){
                    let password = randomUUID();
                    const salt =  bcrypt.genSaltSync(10);
                    let myroleid 
                        switch(req.body.role){
                                case 'Finance':
                                    myroleid=3;
                                    break;
                                case 'Customer Service':
                                    myroleid=5;
                                    break;
                                case 'Quality Assurance':
                                    myroleid=4;
                                    break;
                                case 'Operation Manager':
                                    myroleid=2;
                                    break;
                                case 'Digital asset':
                                    myroleid=6;
                                    break;
                                

                        }

                    let createAdmin =   await admin.create({
                        firstname:req.body.fname,
                        lastname:req.body.lname,
                        email:req.body.email,
                        username:req.body.username,
                        password:bcrypt.hashSync(password, salt),
                        role:req.body.role,
                        roleid:myroleid,
                        status:'active'
                    });

                    if(createAdmin){
                        req.body.previleges.forEach(d => {
                
                            admin.findOneAndUpdate({_id:createAdmin._id},{$push:{
                                previledge:d
                           }},(err,docs)=>{
                               if(err){
                                   res.send(err);
                               }
                               
                           })
                           
                       }); 
                    }
                   
        
                    if(createAdmin){
                        // await SendPasswordMail(password,req.body.email);
                        const mailData = {
                            from: 'Jupit<hello@jupitapp.co>',  // sender address
                            to: req.body.email,   // list of receivers
                            subject: `Onboarding@jupitapp.co <One Time Password>`,
                            text: 'That was easy!',
                            html: `
                            <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                            
                            <head>
                              <!--[if gte mso 9]>
                            <xml>
                              <o:OfficeDocumentSettings>
                                <o:AllowPNG/>
                                <o:PixelsPerInch>96</o:PixelsPerInch>
                              </o:OfficeDocumentSettings>
                            </xml>
                            <![endif]-->
                              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <meta name="x-apple-disable-message-reformatting">
                              <!--[if !mso]><!-->
                              <meta http-equiv="X-UA-Compatible" content="IE=edge">
                              <!--<![endif]-->
                              <title></title>
                            
                              <style type="text/css">
                                @media only screen and (min-width: 570px) {
                                  .u-row {
                                    width: 550px !important;
                                  }
                                  .u-row .u-col {
                                    vertical-align: top;
                                  }
                                  .u-row .u-col-100 {
                                    width: 550px !important;
                                  }
                                }
                                
                                @media (max-width: 570px) {
                                  .u-row-container {
                                    max-width: 100% !important;
                                    padding-left: 0px !important;
                                    padding-right: 0px !important;
                                  }
                                  .u-row .u-col {
                                    min-width: 320px !important;
                                    max-width: 100% !important;
                                    display: block !important;
                                  }
                                  .u-row {
                                    width: calc(100% - 40px) !important;
                                  }
                                  .u-col {
                                    width: 100% !important;
                                  }
                                  .u-col>div {
                                    margin: 0 auto;
                                  }
                                }
                                
                                body {
                                  margin: 0;
                                  padding: 0;
                                }
                                
                                table,
                                tr,
                                td {
                                  vertical-align: top;
                                  border-collapse: collapse;
                                }
                                
                                p {
                                  margin: 0;
                                }
                                
                                .ie-container table,
                                .mso-container table {
                                  table-layout: fixed;
                                }
                                
                                * {
                                  line-height: inherit;
                                }
                                
                                a[x-apple-data-detectors='true'] {
                                  color: inherit !important;
                                  text-decoration: none !important;
                                }
                                
                                table,
                                td {
                                  color: #000000;
                                }
                                
                                a {
                                  color: #0000ee;
                                  text-decoration: underline;
                                }
                                
                                @media (max-width: 480px) {
                                  #u_content_image_4 .v-src-width {
                                    width: auto !important;
                                  }
                                  #u_content_image_4 .v-src-max-width {
                                    max-width: 80% !important;
                                  }
                                }
                              </style>
                            
                            
                            
                              <!--[if !mso]><!-->
                              <link href="https://fonts.googleapis.com/css?family=Lato:400,700" rel="stylesheet" type="text/css">
                              <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700" rel="stylesheet" type="text/css">
                              <!--<![endif]-->
                            
                            </head>
                            
                            <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
                              <!--[if IE]><div class="ie-container"><![endif]-->
                              <!--[if mso]><div class="mso-container"><![endif]-->
                              <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
                                <tbody>
                                  <tr style="vertical-align: top">
                                    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                      <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
                            
                            
                                      <div class="u-row-container" style="padding: 0px;background-color: transparent">
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                                          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #ffffff;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
                                              <div style="width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                  <!--<![endif]-->
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                              <td style="padding-right: 0px;padding-left: 0px;" align="center">
                            
                                                                <img align="center" border="0" src="https://images.unlayer.com/projects/89020/1657367336441-895948.png" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 205px;"
                                                                  width="205" class="v-src-width v-src-max-width" />
                            
                                                              </td>
                                                            </tr>
                                                          </table>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <!--[if (!mso)&(!IE)]><!-->
                                                </div>
                                                <!--<![endif]-->
                                              </div>
                                            </div>
                                            <!--[if (mso)|(IE)]></td><![endif]-->
                                            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                          </div>
                                        </div>
                                      </div>
                            
                            
                            
                                      <div class="u-row-container" style="padding: 0px;background-color: transparent">
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                                          <div style="border-collapse: collapse;display: table;width: 100%;background-image: url('https://cdn.templates.unlayer.com/assets/1636376675254-sdsdsd.png');background-repeat: no-repeat;background-position: center top;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-image: url('https://cdn.templates.unlayer.com/assets/1636376675254-sdsdsd.png');background-repeat: no-repeat;background-position: center top;background-color: transparent;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
                                              <div style="width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                                  <!--<![endif]-->
                            
                                                  <table id="u_content_image_4" style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:50px 10px 25px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                              <td style="padding-right: 0px;padding-left: 0px;" align="center">
                            
                                                                <img align="center" border="0" src="https://cdn.templates.unlayer.com/assets/1636374086763-hero.png" alt="Hero Image" title="Hero Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 54%;max-width: 286.2px;"
                                                                  width="286.2" class="v-src-width v-src-max-width" />
                            
                                                              </td>
                                                            </tr>
                                                          </table>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                  <tbody>
                                                    <tr>
                                                      <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 10px;font-family:arial,helvetica,sans-serif;" align="left">
                          
                                                        <div style="color: #a7a5a5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                          <p style="font-size: 14px; line-height: 140%;"><strong><span style="font-family: Lato, sans-serif; font-size: 14px; line-height: 19.6px;">Dear ${req.body.role},</span></strong></p>
                                                        </div>
                          
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 20px 5px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <h2 style="margin: 0px; color: #141414; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: 'Open Sans',sans-serif; font-size: 28px;">
                                                            <strong>Here Is Your One Time Password</strong>
                                                          </h2>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:15px 10px 12px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <h1 style="margin: 0px; color: #3b4d63; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 41px;">
                                                            <strong><span style="text-decoration: underline;">${password}</span></strong>
                                                          </h1>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 117px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <div style="color: #1c1c93; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 18px; line-height: 25.2px;"><strong><span style="font-family: Lato, sans-serif; line-height: 25.2px; font-size: 18px;">Valid For 15 minutes Only!</span></strong>
                                                              </span>
                                                            </p>
                                                          </div>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <!--[if (!mso)&(!IE)]><!-->
                                                </div>
                                                <!--<![endif]-->
                                              </div>
                                            </div>
                                            <!--[if (mso)|(IE)]></td><![endif]-->
                                            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                          </div>
                                        </div>
                                      </div>
                            
                            
                            
                                      <div class="u-row-container" style="padding: 0px;background-color: transparent">
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 550px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #000000;">
                                          <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:550px;"><tr style="background-color: #000000;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="550" style="width: 550px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 550px;display: table-cell;vertical-align: top;">
                                              <div style="width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                                  <!--<![endif]-->
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="83%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #443e3e;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                            <tbody>
                                                              <tr style="vertical-align: top">
                                                                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                  <span>&#160;</span>
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          </table>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <div align="center">
                                                            <div style="display: table; max-width:44px;">
                                                              <!--[if (mso)|(IE)]><table width="44" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:44px;"><tr><![endif]-->
                            
                            
                                                              <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                                              <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                                                <tbody>
                                                                  <tr style="vertical-align: top">
                                                                    <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                                      <a href="https://instagram.com/" title="Instagram" target="_blank">
                                                                        <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                                      </a>
                                                                    </td>
                                                                  </tr>
                                                                </tbody>
                                                              </table>
                                                              <!--[if (mso)|(IE)]></td><![endif]-->
                            
                            
                                                              <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                                            </div>
                                                          </div>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <table height="0px" align="center" border="0" cellpadding="0" cellspacing="0" width="83%" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #443e3e;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                            <tbody>
                                                              <tr style="vertical-align: top">
                                                                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                  <span>&#160;</span>
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          </table>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 20px;font-family:arial,helvetica,sans-serif;" align="left">
                            
                                                          <div style="color: #a3b2c3; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 140%;">Jupitapp</p>
                                                          </div>
                            
                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>
                            
                                                  <!--[if (!mso)&(!IE)]><!-->
                                                </div>
                                                <!--<![endif]-->
                                              </div>
                                            </div>
                                            <!--[if (mso)|(IE)]></td><![endif]-->
                                            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                          </div>
                                        </div>
                                      </div>
                            
                            
                                      <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <!--[if mso]></div><![endif]-->
                              <!--[if IE]></div><![endif]-->
                            </body>
                            
                            </html>
                                `
                          };
                        transporter.sendMail(mailData, function (err, info) {
                            if(err){
                                console.log(err);
                                // res.status(400).send(err)
                                res.status(400).send({"message":"An Error Occurred","callback":err})
                            }
                            
                            else{
                                
                                res.send({"message":"Staff Creation was Successful..OTP has been sent to the registered Email","callback":info,"status":true})
                                
                            }
                              
                         });
                    }
                    else{
                        res.status(400).send('Admin Creation was Unsuccessful..Contact Dev Team')
                    }
                }
            })

        }
    })
    
    
});

router.post('/delete/staff',(req,res)=>{
    admin.deleteOne({_id:req.body.userid},(err,docs)=>{
        if(err){
            res.json(err)
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        if(docs){
            res.send({
                "message":"Staff Successfully Deleted",
                "status":true
            })
        }
    })
})

router.post('/activate/deactivate/staff',(req,res)=>{
    
    admin.findOneAndUpdate({_id:req.body.userid},{$set:{status:req.body.statusUpdate}},(err,docs)=>{
        if(err){
            res.json(err)
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        if(docs){
            res.send({
                "message":"Staff Successfully Deactivated",
                "status":true
            })
        }
    })
})

router.get('/admit/staff',(req,res)=>{
    Logger.find({status:'pending'},(err,docs)=>{
        if(err){
            res.status(400).send('A Error Occurred')
        }
        else if(docs){
            res.send(docs);
        }
    }).limit(1).sort({updated: -1})
})

router.post('/check/login/approval/status',(req,res)=>{
    Logger.find({userid:req.body.userid},(err,docs)=>{
        if(err){
            res.status(400).send('A Error Occurred')
        }
        else if(docs){
            res.send(docs);
        }
    }).limit(1).sort({updated: -1})
})


router.get('/all/for/card',async (req,res)=>{
    const allusers = await getusersCount();
    const deposit = await getalldeposit();
    const withdrawal = await getallwithdrawal();
    const transactioncount = await gettransactioncount();

    res.send({
        "allusers":allusers,
        "deposit":deposit,
        "withdrawal":withdrawal,
        "transaction":transactioncount
    })
    
})

async function getusersCount(){
   let result = await Usermodel.find({},(err,docs)=>{
       if(err){
            return [false,'Internal Server'];
       }
       else{
           return [true,docs];
       }
   }).clone().catch(function(err){ console.log(err)});

   return result;
}


async function getalldeposit(){
    let result = buy_n_sell.find({},(err,docs)=>{
        if(err){
             return [false,'Internal Server'];
        }
        else{
            return [true,docs];
        }
    }).clone().catch(function(err){ console.log(err)});
 
    return result;
 }

 async function getallwithdrawal(){
    let result = await withdrawal.find({},(err,docs)=>{
        if(err){
             return [false,'Internal Server'];
        }
        else{
            return [true,docs];
        }
    }).clone().catch(function(err){ console.log(err)});
 
    return result;
 }


 async function gettransactioncount(){
    let result = await wallet_transactions.find({},(err,docs)=>{
        if(err){
             return [false,'Internal Server'];
        }
        else{
            return [true,docs];
        }
    }).clone().catch(function(err){ console.log(err)});
 
    return result;
 }

 router.post('/deactivate/user/profile',(req,res)=>{
    let status = req.body.updatestatus;
     Usermodel.findOneAndUpdate({_id:req.body.id},{$set:{Status:status}},(err,docs)=>{
         if(err){
             res.status(400).send(err);
         }
         else if(docs){
             res.send(docs.Status)
         }
     })
 })

 router.post('/deactivate/user/suspension',(req,res)=>{
    let status = req.body.updatestatus;
     Usermodel.findOneAndUpdate({_id:req.body.id},{$set:{suspension:status}},(err,docs)=>{
         if(err){
             res.status(400).send(err);
         }
         else if(docs){
             res.send(docs.suspension)
         }
     })
 })

 router.post('/deactivate/user/blacklist',(req,res)=>{
    let status = req.body.updatestatus;
     Usermodel.findOneAndUpdate({_id:req.body.id},{$set:{blacklist:status}},(err,docs)=>{
         if(err){
             res.status(400).send(err);
         }
         else if(docs){
             res.send(docs.blacklist)
         }
     })
 })

 router.post('/deactivate/2fa',(req,res)=>{
   
     Usermodel.findOneAndUpdate({_id:req.body.id},{$set:{TWOFA:false}},(err,docs)=>{
         if(err){
             res.status(400).send(err);
         }
         else if(docs){
             res.send(docs)
         }
     })
 })

 router.get('/all/deposit',(req,res)=>{
   
    deposit_webhook.find({},(err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
            res.send(docs)
        }
    })
})

router.get('/all/withdrawal',(req,res)=>{
   
    withdrawal.find({},(err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
            res.send(docs)
        }
    })
})

router.post('/edit/user/email',(req,res)=>{
    Usermodel.findOneAndUpdate({_id:req.body.id},{$set:{'email':req.body.email}},(err,docs)=>{
        if(err){
            res.status(400).send('Internal Server Error');
        }
        else{
            res.send('Updated')
        }
    })
})

router.get('/all/giftcard',(req,res)=>{
    giftCardnew.find({},'brandname',(err,docs)=>{
        if(err){
            res.status(400).send('Internal Server Error');
        }
        else {
            res.send(docs);
        }
    })
})


router.post('/kyclevel3/action',(req,res)=>{
    let status=""
    let statustype = false;
    if(req.body.option == "approve"){
         status = "Verified";
         statustype = true
    }
    else if(req.body.option == "disapprove"){
         status = "rejected";
         statustype = false
    }
    console.log("body",req.body)
    kyc.findOneAndUpdate({userid:req.body._id},{$set:{'level3.0.idcard_type':req.body.cardtype,'level3.0.uniqueNumber':req.body.cardnumber,'level3.0.callbackStatus':status,'level3.0.status':statustype}},async (err,docs)=>{
        if(err){
            res.status(400).send('Internal Server Error');
        }
        else{ 
            
            
            await idcardverification.findOneAndUpdate({userid:req.body._id,status:'Pending'},{$set:{'status':status}},(err,docv)=>{
                if(err){
                    res.send(400).send('Internal Sever Error');
                }
                else{
                   
                }
            }).clone().catch(function(err){ console.log(err)});
            await notification.create({
                type:3,
                orderid:'0000',
                transfertype:status,
                asset:'KYC LEvel 3',
                from_address:req.body.cardtype,
                to_address:req.body.cardnumber,
                status:'Completed',
                read:'unread',
                date_created:new Date(),
                initiator:req.body.email,
            })
            res.send('Update was Successfully');
        }
    })
})


router.get('/get/all/buy/transaction',(req,res)=>{
    buy_n_sell.find({type:'Buy'},(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else{
            res.send(docs)
        }
    })
})

router.get('/get/all/sell/transaction',(req,res)=>{
    buy_n_sell.find({type:'Sell'},(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else{
            res.send(docs)
        }
    })
})
router.get('/get/all/buy_n_sell/transaction',(req,res)=>{
    buy_n_sell.find({},(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else{
            res.send(docs)
        }
    })
})


router.post('/get/cryptoasset/set',async (req,res)=>{
    
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    console.log(startDate.split('T')[0])
    let momentum_start = moment(startDate.split('T')[0]).startOf('day').toDate()
    let momentum_end = moment(endDate.split('T')[0]).endOf('day').toDate()
  console.log(momentum_start,momentum_end)

    let BTC_IN ,BTC_OUT,USDT_IN,USDT_OUT
    
    if(startDate && endDate ){
        
      
        BTC_IN = await wallet_transactions.aggregate([
        
            { $match: {
                
                  $and:[
                        {
                            updated: {
                
                                $gte: momentum_start,
                                $lte:momentum_end
                                
                            }

                        },
                       
                        {
                            currency:'BTC'
                        },
                        {
                            $or:[
                                {
                                    type:'Buy'
                                },
                                {
                                    type:'Receive'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address",updatted:"$updated"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                    
                },
                
            }, 
          
        ])
    
        BTC_OUT = await wallet_transactions.aggregate([
            
            { $match: {
                
                  $and:[
                        {
                                updated: {
                
                                    $gte: momentum_start,
                                    $lt: momentum_end
                            }
                        },
                        {
                            currency:'BTC'
                        },
                        {
                            $or:[
                                {
                                    type:'Sell'
                                },
                                {
                                    type:'Send'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
    
        USDT_IN = await wallet_transactions.aggregate([
            
            { $match: {
                
                  $and:[
                        {
                                updated: {
                
                                    $gte: momentum_start,
                                    $lt: momentum_end
                            }
                        },
                        {
                            currency:'USDT'
                        },
                        {
                            $or:[
                                {
                                    type:'Buy'
                                },
                                {
                                    type:'Receive'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
    
        USDT_OUT = await wallet_transactions.aggregate([
            
            { $match: {
                
                  $and:[
                        {
                                updated: {
                    
                                    $gte: momentum_start,
                                    $lt: momentum_end
                                }
                        },
                        {
                            currency:'USDT'
                        },
                        {
                            $or:[
                                {
                                    type:'Sell'
                                },
                                {
                                    type:'Send'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
            
    }
    else{
        BTC_IN = await wallet_transactions.aggregate([
        
            { $match: {
                
                  $and:[
                        {
                            currency:'BTC'
                        },
                        {
                            $or:[
                                {
                                    type:'Buy'
                                },
                                {
                                    type:'Receive'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
    
        BTC_OUT = await wallet_transactions.aggregate([
            
            { $match: {
                
                  $and:[
                        {
                            currency:'BTC'
                        },
                        {
                            $or:[
                                {
                                    type:'Sell'
                                },
                                {
                                    type:'Send'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
    
        USDT_IN = await wallet_transactions.aggregate([
            
            { $match: {
                
                  $and:[
                        {
                            currency:'USDT'
                        },
                        {
                            $or:[
                                {
                                    type:'Buy'
                                },
                                {
                                    type:'Receive'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
    
        USDT_OUT = await wallet_transactions.aggregate([
            
            { $match: {
                
                  $and:[
                        {
                            currency:'USDT'
                        },
                        {
                            $or:[
                                {
                                    type:'Sell'
                                },
                                {
                                    type:'Send'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
    }


    
    let btc_asset_balance = 0;
    let usdt_asset_balance=0
    let btc_in = 0;
    let btc_out = 0;
    let usdt_in = 0;
    let usdt_out=0;
    let sum_amt_btc_in = 0
    let sum_amt_btc_out = 0
    let sum_amt_usdt_in = 0
    let sum_amt_usdt_out = 0
    
    if(BTC_IN.length > 0){
       BTC_IN.forEach((d)=>{
        sum_amt_btc_in += d.amount 
       })
       btc_in = sum_amt_btc_in;
       
    }
    if(BTC_OUT.length > 0){
        BTC_OUT.forEach((d)=>{
            sum_amt_btc_out += d.amount 
        })
        btc_out = sum_amt_btc_out;
    }

    if(USDT_IN.length > 0 ){
        USDT_IN.forEach((d)=>{
            sum_amt_usdt_in += d.amount 
           })
            usdt_in = sum_amt_usdt_in;
        // usdt_in = USDT_IN[0].amount;
        
    }
    if(USDT_OUT.length > 0 ){
        // usdt_out = USDT_OUT[0].amount;
        //usdt_asset_balance = parseFloat(USDT_IN[0].amount) - parseFloat(USDT_OUT[0].amount)
        USDT_OUT.forEach((d)=>{
            sum_amt_usdt_out += d.amount 
           })
            usdt_out = sum_amt_usdt_out;
    }

    btc_asset_balance = parseFloat(btc_in) - parseFloat(btc_out)
    usdt_asset_balance = parseFloat(usdt_in) - parseFloat(usdt_out)

    res.send({
        'BTC_BALANCE':btc_asset_balance.toFixed(8),
        'USDT_BALANCE':usdt_asset_balance.toFixed(8),
        'BTC_IN':BTC_IN,
    });
    
    //  res.json({
    //     'BTC_IN':btc_in,
    //     'BTC_OUT':btc_out,
    //     'USDT_IN':usdt_in,
    //     'USDT_OUT':usdt_out,
    //     // 'USDT_IN':USDT_IN[0]?.amount,
    //     // 'BTC_OUT':BTC_OUT[0]?.amount,
    //     // 'USDT_OUT':USDT_OUT[0]?.amount,
    //     'btc_asset_balance':btc_asset_balance.toFixed(8),
    //     'usdt_asset_balance':usdt_asset_balance.toFixed(8)
    //  });
    //   console.log(dateToken);
         
        
  
})


router.post('/get/fiatasset/set',async (req,res)=>{
    
    let NGN_IN,NGN_IN_II,NGN_OUT,NGN_OUT_II
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let momentum_start = moment(startDate.split('T')[0]).startOf('day').toDate()
    let momentum_end = moment(endDate.split('T')[0]).endOf('day').toDate()
    if(startDate && endDate ){
        
        console.log(new Date(startDate))
        console.log(new Date(endDate))
        NGN_IN = await wallet_transactions.aggregate([
        
            { $match: {
                
                  $and:[
                        {
                            updated: {
                
                                $gte: momentum_start,
                                $lte:momentum_end
                                
                            }

                        },
                       
                        {
                            type:'Sell'
                        },
                        {
                            $or:[
                                {
                                    currency:'BTC'
                                },
                                {
                                    currency:'USDT'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address",updatted:"$updated"},
                    amount: { 
                        
                        $sum: {
                            "$toDouble": "$nairavalue"
                          }
                    } 
                    
                },
                
            }, 
          
        ])

        NGN_IN_II = await deposit_webhook.aggregate([
        
            { 
                $match: {
                        updated: {
                        
                            $gte: momentum_start,
                            $lte:momentum_end
                            
                        }
                    }
            
                },
            { 
                $group : { 
                    _id : {updatted:"$updated"},
                    amount: { 
                            $sum: {
                                "$toDouble": "$amount"
                            }
                        } 
                },
                
            }, 
          
        ])

        
    
        NGN_OUT = await wallet_transactions.aggregate([
            
            { $match: {
                
                  $and:[
                        {
                            updated: {
            
                                $gte: momentum_start,
                                $lt: momentum_end
                            }
                        },
                        {
                            type:'Buy'
                        },
                        {
                            $or:[
                                {
                                    currency:'BTC'
                                },
                                {
                                    currency:'USDT'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        $sum: {
                            "$toDouble": "$nairavalue"
                          }
                        } 
                },
                
            }, 
          
        ])


        NGN_OUT_II = await withdrawal.aggregate([
        
            { 
                $match: {
                        updated: {
                        
                            $gte: momentum_start,
                            $lte:momentum_end
                            
                        }
                    }
            
                },
            { 
                $group : { 
                    _id : {updatted:"$updated"},
                    amount: { 

                        $sum: {
                            "$toDouble": "$amount"
                          }
                        
                       } 
                },
                
            }, 
          
        ])
        
    }
    else{

        NGN_IN = await wallet_transactions.aggregate([
        
            { $match: {
                
                  $and:[
                        {
                            type:'Sell'
                        },
                        {
                            $or:[
                                {
                                    currency:'BTC'
                                },
                                {
                                    currency:'USDT'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" }},
                    amount: {
                         
                         $sum: {
                            "$toDouble": "$nairavalue"
                          }
                    
                        } 
                },
                
            }, 
          
        ])

        NGN_IN_II = await deposit_webhook.aggregate([
        
            { 
                $match: {}
            
                },
            { 
                $group : { 
                    _id : {updatted:"$updated"},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
    
        NGN_OUT = await wallet_transactions.aggregate([
            
            { $match: {
                
                  $and:[
                        {
                            type:'Buy'
                        },
                        {
                            $or:[
                                {
                                    currency:'BTC'
                                },
                                {
                                    currency:'USDT'
                                }
            
                            ]
                        }
                    
            
                    ]
              
                }
            
            },
            { 
                $group : { 
                    _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"},
                    amount: { 
                        
                        $sum: {
                            "$toDouble": "$nairavalue"
                          }
                    } 
                },
                
            }, 
          
        ])
        NGN_OUT_II = await withdrawal.aggregate([
        
            { 
                $match: {}
            
                },
            { 
                $group : { 
                    _id : {updatted:"$updated"},
                    amount: { 
                       
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                },
                
            }, 
          
        ])
    
       
    }


    
    let ngn_asset_balance_in 
    let ngn_asset_balance_out
    let ngn_asset_balance 
    let ngn_in = 0;
    let ngn_in_II = 0;

    let ngn_out = 0;
    let ngn_out_II = 0;
    
    let sum_ngn_in = 0
    let sum_ngn_in_II = 0

    let sum_ngn_out = 0
    let sum_ngn_out_II = 0
    
    if(NGN_IN.length > 0){
       NGN_IN.forEach((d)=>{
        sum_ngn_in += d.amount 
       })
       ngn_in = sum_ngn_in;
       
    }
    if(NGN_IN_II.length > 0){
        NGN_IN_II.forEach((d)=>{
         sum_ngn_in_II += d.amount 
        })
        ngn_in_II = sum_ngn_in_II;
        
     }
     if(NGN_OUT.length > 0){
        NGN_OUT.forEach((d)=>{
         sum_ngn_out += d.amount 
        })
        ngn_out = sum_ngn_out;
        
     }
     if(NGN_OUT_II.length > 0){
         NGN_OUT_II.forEach((d)=>{
          sum_ngn_out_II += d.amount 
         })
         ngn_out_II = sum_ngn_out_II;
         
      }
    
    ngn_asset_balance_in = parseFloat(ngn_in)  + parseFloat(ngn_in_II)
    ngn_asset_balance_out = parseFloat(ngn_out) + parseFloat(ngn_out_II)
    ngn_asset_balance = parseFloat(ngn_asset_balance_in) - parseFloat(ngn_asset_balance_out)
    res.send({
        'NGN_BALANCE':ngn_asset_balance,
        'NGN_BALANCE_IN':ngn_asset_balance_in,
        'NGN_BALANCE_OUT':ngn_asset_balance_out,
        

    });
      
  
})

router.post('/get/transaction/count',async(req,res)=>{
    let startDate = req.body.startdate;
    let endDate = req.body.enddate; 
    let asset = req.body.asset
      let momentum_start = moment(startDate).startOf('day').toDate()
      let momentum_end = moment(endDate).endOf('day').toDate()
    

    // res.send({
       
    //     "newEndDate":new Date(endDate).getDay(),
    //     "extractor":new Date(startDate).getFullYear() +'-'+ new Date(startDate).getMonth() +'-'+ new Date(startDate).getDate(),
    //     "extract":extractor,
    //     "body":req.body,
    //     "momentum":momentum_start,
    //     "momentum_end":momentum_end


        
    // });
    // return false
    let Buy,Sell,Send,Receive,Deposit,Withdrawal
    if(startDate && endDate){
        Buy = await wallet_transactions.aggregate([
            { 
                $match: {
                    $and:[
                        {
                            type:'Buy'
                        },
                        {
                            updated: {
                
                                $gte: momentum_start,
                                $lte:momentum_end
                                
                            }
                        },
                        {
                            currency:req.body.asset
                        }
                    ]
                    
                }
            
            },
            {
                $count: "type"
            }
           ])
        
           Sell = await wallet_transactions.aggregate([
            { 
                $match: {
                    $and:[
                        {
                            type:'Sell'
                        },
                        {
                            updated: {
                
                                $gte: momentum_start,
                                $lte:momentum_end
                                
                            }
                        },
                        {
                            currency:req.body.asset
                        }
                    ]
                }
            
            },
            {
                $count: "type"
            }
           ])
           Send = await wallet_transactions.aggregate([
            { 
                $match: {
                    $and:[
                        {
                            type:'Send'
                        },
                        {
                            updated: {
                
                                $gte: momentum_start,
                                $lte:momentum_end
                                
                            }
                        },
                        {
                            currency:req.body.asset
                        }
                    ]
                }
            
            },
            {
                $count: "type"
            }
           ])
            Receive = await wallet_transactions.aggregate([
            { 
                $match: {
                    $and:[
                        {
                            type:'Receive'
                        },
                        {
                            updated: {
                
                                $gte: momentum_start,
                                $lte:momentum_end
                                
                            }
                        },
                        {
                            currency:req.body.asset
                        }
                    ]
                }
            
            },
            {
                $count: "type"
            }
           ])
        
            Deposit = await deposit_webhook.aggregate([
            { 
                $match: {
                    updated: {
                
                        $gte: momentum_start,
                        $lte:momentum_end
                        
                    }
                }
            
            },
            {
                $count: "amount"
            }
           ])
        
            Withdrawal = await withdrawal.aggregate([
            { 
                $match: {

                    updated: {
                
                        $gte: momentum_start,
                        $lte:momentum_end
                        
                    }
                }
            
            },
            {
                $count: "amount"
            }
           ])
        
    }
    else{

        Buy = await wallet_transactions.aggregate([
            { 
                $match: {
                    $and:[
                        {
                            type:'Buy'
                        },
                        {
                            currency:req.body.asset
                        }
                    ]
                }

            
            },
            {
                $count: "type"
            }
           ])
        
           Sell = await wallet_transactions.aggregate([
            {
                $match: {
                    $and:[
                        {
                            type:'Sell'
                        },
                        {
                            currency:req.body.asset
                        }
                    ]
                }
            },
            {
                $count: "type"
            }
           ])
           Send = await wallet_transactions.aggregate([
            { 
                $match: {
                   $and:[
                        {
                            type:'Send'
                        },
                        {
                            currency:req.body.asset
                        }
                    ]
                }
            
            },
            {
                $count: "type"
            }
           ])
            Receive = await wallet_transactions.aggregate([
            { 
                $match: {
                    $and:[
                        {
                            type:'Receive'
                        },
                        {
                            currency:req.body.asset
                        }
                    ]
                }
            
            },
            {
                $count: "type"
            }
           ])
        
            Deposit = await deposit_webhook.aggregate([
            { 
                $match: {
                    
                }
            
            },
            {
                $count: "amount"
            }
           ])
        
            Withdrawal = await withdrawal.aggregate([
            { 
                $match: {
                    
                }
            
            },
            {
                $count: "amount"
            }
           ])
        

    }
    let BuyCount,SellCount,SendCount,ReceiveCount,WithdrawalCount,DepositCount = 0
    if(Buy.length >0){
        BuyCount = Buy[0].type
    }
    else{
        BuyCount=0
    }
    if(Sell.length > 0){
        SellCount = Sell[0].type
    }
    else{
        SellCount
    }
    if(Send.length >0){
        SendCount = Send[0].type
    }
    else{
        SendCount = 0
    }
    if(Receive.length >0){
        ReceiveCount = Receive[0].type
    }
    else{
        ReceiveCount = 0
    }
    if(Deposit.length >0){
        DepositCount = Deposit[0].amount
    }
    else{
        DepositCount=0
    }

    if(Withdrawal.length >0){
        WithdrawalCount = Withdrawal[0].amount
    }
    else{
        WithdrawalCount=0
    }
   
   res.send({
    "Buy":BuyCount,
    "Sell":SellCount,
    "Send":SendCount,
    "Receive":ReceiveCount,
    "Withdrawal":WithdrawalCount,
    "Deposit":DepositCount,
    "body":req.body
   })
   

})

async function extractDate(date){
    let dayx = new Date(date).getDate();
    let month = new Date(date).getMonth();
    let year = new Date(date).getFullYear();

    let join = year+'-'+month+'-'+dayx

    return join;
}

router.post('/create/role',(req,res)=>{
    adminroles.findOne({rolename:req.body.rolename},(err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
            res.status(400).send('Role Already Exist');
        }
        else if (!docs){
            adminroles.create({
                rolename:req.body.rolename,
                status:'active'
            })
            res.send('Role Successfully Created');
        }
    })
})

router.get('/get/allroles',(req,res)=>{

    adminroles.find({},(err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else{
            res.send({
                "message":"Roles Recovered",
                "data":docs
            })
        }
    })

})
router.get('/get/all/cryptoledger',(req,res)=>{
    cryptoledger.find({},(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else if(docs){
            res.send(docs)
        }
    })
})
 
router.get('/get/all/fiatledger',(req,res)=>{
    fiatledger.find({},(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else if(docs){
            res.send(docs)
        }
    })
})
 
export default router