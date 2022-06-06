
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

  const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtppro.zoho.com",
       auth: {
            user:'hello@jupitapp.co',
            pass:'w6vBmv6624eW'
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
            const validPassword = bcrypt.compareSync(req.body.password, docs.password);

            if(validPassword){
                    var dt = NodeDateTime.create();
                    var formatted = dt.format('Y-m-d H:M:S');
                    
                    let updateAdminLogin = await admin.findOneAndUpdate({_id:docs._id},{$set:{'loginTime':formatted}})
                    
                    if(updateAdminLogin){
                       // console.log('updateAdmin',updateAdminLogin)
                        admin.findOne({_id:docs._id},(err,document)=>{
                            if(err){
                                res.status(400).send({
                                    "message":err
                                })
                            }
                            else if(document){
                                  
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
                res.status(400).send({"message":'Invalid Password',"status":false});
            }
            
        }
        else if(!docs){
            res.status(400).send({"message":'Invalid Username',"status":false});
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
                        // await SendPasswordMail(password,req.body.email);
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
                                                    <p style="font-family:candara;padding:10px;font-size:20px">OTP:<b>${password}</b><p>
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

router.get('/get/all/users',middlewareVerify,(req,res)=>{
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
        res.status(403).send('Forbidden Request');
    }
    else{
        
        let decodedJwt = await parseJwt(bearerHeader);
      
        if(!decodedJwt){
            res.status(403).send({"message":"Forbidden Request"});
            return false;
        }
        admin.findOne({email:decodedJwt.admin.email},(err,docs)=>{
            if(err){
                console.log(err)
                res.status(403).send({"message":"Forbidden Request"});
            }
            else if(docs){
                
                if(docs.password === decodedJwt.admin.password){
                    req.token = bearerHeader;
                    next();
                }
                if(docs.password != decodedJwt.admin.password){
                    console.log('Wrong password');
                    res.status(403).send({"message":"Password Expired"});
                }
                // if(docs.SessionMonitor === "Active"){
                //     req.token = bearerHeader;
                //     next();
                // }
                // if(docs.SessionMonitor != "Active"){
                //     console.log('Account Blocked');
                //     res.sendStatus(403);
                // }
                
                // const validPassword = bcrypt.compareSync(password, docs.password);
            }
            else if(!docs){
                res.status(403).send({"message":"Forbidden Request"});
            }
        })
        
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
        console.log('btc',req.body.title)
        let AddFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'btc_wallet.0.balance':parseFloat(req.body.value).toFixed(8)}}).exec();
        if(AddFund){
            res.send({
                "message":"Wallet Successfully Updated",
                "status":true
            })
        }
        else{
            res.send({
                "message":"Wallet Update Error",
                "status":false
            })
        }
    
    }
    else if(req.body.modalTitle === "USDT Wallet Balance"){
        console.log('usdt',req.body.title)
        let AddFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'usdt_wallet.0.balance':parseFloat(req.body.value).toFixed(6)}}).exec();
        if(AddFund){
            res.send({
                "message":"Wallet Successfully Updated",
                "status":true
            })
        }
        else{
            res.send({
                "message":"Wallet Update Error",
                "status":false
            })
        }
    
    }
    else if(req.body.modalTitle === "Naira Wallet Balance"){
        console.log('naiara',req.body.userid)
        let AddFund = await Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'naira_wallet.0.balance':parseFloat(req.body.value)}}).exec();
        if(AddFund){
            res.send({
                "message":"Wallet Successfully Updated",
                "status":true
            })
        }
        else{
            res.send({
                "message":"Wallet Update Error",
                "status":false
            })
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

router.post('/set/rate/btc',middlewareVerify,(req,res)=>{
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



router.post('/set/rate/usdt',middlewareVerify,(req,res)=>{
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


router.post('/set/rate/giftcard',middlewareVerify,(req,res)=>{
    let btc_sell_rate = req.body.amount
    let initial = "JupitRateBard"

    if(req.body.type === "GIFTCARD_SELL"){
        
        let x = rate.findOneAndUpdate({initialization:initial},{$set:{'giftcard.1.sell':req.body.giftcard_sell}},(err,docs)=>{
            if(err){
                res.send(err);
            }
            else{
                res.send({
                    "message":"GIFTCARD Sell Rate Successfully Saved",
                    "docs":docs
                })
            }
        })
    }

    if(req.body.type === "GIFTCARD_BUY"){
        
        let x = rate.findOneAndUpdate({initialization:initial},{$set:{'giftcard.0.buy':req.body.giftcard_buy}},(err,docs)=>{
            if(err){
                res.send(err);
            }
            else{
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
    giftcardtransactions.find({status:'untreated'},(err,docs)=>{
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
router.get('/all/staff',middlewareVerify,(req,res)=>{
    admin.find({},(err,docs)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send(docs)
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
                        // await SendPasswordMail(password,req.body.email);
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
                                                    <p style="font-family:candara;padding:10px;font-size:16px">Dear ${req.body.role},<br/> Congratulations on the creation of your administrative account on the jupit platform.</p>
                                                    <p style="font-family:candara;padding:10px;font-size:16px>Kindly find below your One Time Password, which should be change upon your successful login to your dashboard.</p>
                                                    <p style="font-family:candara;padding:10px;font-size:20px">OTP:<b>${password}</b><p>
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

router.post('/deactivate/staff',(req,res)=>{
    admin.findOneAndUpdate({_id:req.body.userid},{$set:{status:'non-active'}},(err,docs)=>{
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

export default router