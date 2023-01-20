import express from 'express';
import axios from "axios";
import crypto from 'crypto';
import querystring from 'querystring';
import withdrawal from '../model/withdrawal.js';
import random from 'random-number';
import Usermodel from '../model/users.js';
import Walletmodel from '../model/wallet_transactions.js'
import Notification from '../model/notification.js';
import { randomUUID } from 'crypto'
import wallet_transactions from '../model/wallet_transactions.js';
import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary'
import { Route } from 'express';
import bank from '../model/bank.js';
import rate from '../model/rate.js';
import cryptoledger from '../model/cryptoledger.js';
import https, { get } from 'https'
import fiatledger from '../model/fiatledger.js';
import { SendMailClient } from "zeptomail";


let THRESHOLD_BTC_API_TOKEN_MASSCOLLECTION= "5ohDbALb4D9nXFEBw"
let THRESHOLD_BTC_API_SECRET_MASSCOLLECTION = "3JZEj6R6oZr68dS6d4BLCDhrHUAx"
let THRESHOLD_BTC_WALLET_ID_MASSCOLLECTION = "136821"
let THRESHOLD_BTC_API_REFRESH_TOKEN = "28zoAMRPAjFdHcDgCds4pymvSMhgJfUExWQcjSxfxC6B"



let THRESHOLD_USDT_API_TOKEN_MASSCOLLECTION= "3PmQbapNE8j3EZS2Q"
let THRESHOLD_USDT_API_SECRET_MASSCOLLECTION = "k9quRFMc5FVj1dyAkFyEVTX3Acv"
let THRESHOLD_USDT_WALLET_ID_MASSCOLLECTION = "196649"
let THRESHOLD_USDT_API_REFRESH_TOKEN_MASSCOLLECTION = "GfAnioc8d5qQcMmjKuLNpUCbmTZpgT2L6v6DEzkU8M7h"




let THRESHOLD_BTC_API_TOKEN_MASS_SENDER= "tx3RYb4hZ5mZxKEH"
let THRESHOLD_BTC_API_SECRET_MASS_SENDER = "3VrgE4Uamd7p7CpgpgtJsGHEzZ2W"
let THRESHOLD_BTC_WALLET_ID_MASS_SENDER = "127771"
let THRESHOLD_BTC_API_REFRESH_TOKEN_MASS_SENDER = "6rFQn6YLyVecSA83ceJNYbjYJ7ezES5txHNUBfpA5E34"

let THRESHOLD_USDT_API_TOKEN_MASS_SENDER= "2JgrSbJpctYdVHqVT"
let THRESHOLD_USDT_API_SECRET_MASS_SENDER = "3xhwE4xyFsYvg6iyok6RVEW32nvm"
let THRESHOLD_USDT_WALLET_ID_MASS_SENDER = "870727"
let THRESHOLD_USDT_API_REFRESH_TOKEN_MASS_SENDER = "Dgggh91THwd82ML8goRFu6dLqTGrpEredA1YaiD8pM7t"

//https://vault.thresh0ld.com/v1/sofa
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

const Router  = express.Router();

Router.get('/testprocess',(req,res)=>{
    res.json(HRESHOLD_BTC_API_TOKEN_MASS_SENDER)
    
})



Router.post('/getautofee',async (req,res)=>{
    console.log('Autosum',req.body)
    let Api ="";
    let wallet_id = "";
    let secret = "";

    if(req.body.walletType == "BTC"){
            secret= THRESHOLD_BTC_API_SECRET_MASS_SENDER;
            Api= THRESHOLD_BTC_API_TOKEN_MASS_SENDER
            wallet_id= THRESHOLD_BTC_WALLET_ID_MASS_SENDER
    }
    else if(req.body.walletType == "USDT"){
        wallet_id= THRESHOLD_USDT_WALLET_ID_MASS_SENDER
        Api= THRESHOLD_USDT_API_TOKEN_MASS_SENDER
        secret= THRESHOLD_USDT_API_SECRET_MASS_SENDER
    }
        
    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    function build(params, secret, t, r, postData) {
        const p = params || [];
        p.push(`t=${t}`, `r=${r}`);
        if (!!postData) {
            if (typeof postData === 'string') {
                    p.push(postData);
            } else {
                    p.push(JSON.stringify(postData));
            }
        }
        p.sort();
        p.push(`secret=${secret}`);
        return crypto.createHash('sha256').update(p.join('&')).digest('hex');
    }

   
   // var time = Math.floor(new Date().getTime() / 1000)
   var time = Math.floor(new Date().getTime() / 1000);
//    var time = timestamp - 240;
    // var postData = [{ "block_num": [1] }]
    const params = ['{"block_nums":[1,50,100]}'];

    var CHECKSUM = build(params,secret,time,rand);


    const parameters = {
        t:time,
        r:rand,
    }

    console.log(secret,Api)
    console.log(wallet_id)
    
    const get_request_args = querystring.stringify(parameters);
   
    const url = `https://vault.thresh0ld.com/v1/sofa/wallets/${wallet_id}/autofees?`+ get_request_args
    
    const new_params = {
        "block_nums": [1,50,100]
    }
   await axios.post(url,new_params,{
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':Api,
            'X-CHECKSUM':CHECKSUM,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
   })
   .then((result)=>{
    console.log("here",result.data)
    //    console.log(result.data['auto_fees'][0]['auto_fee'])
    let bankCheck;
        bank.findOne({email:req.body.email},async (err,docs)=>{
            if(err){
                res.status(400).send(err)
            }
            else if(docs){
                bankCheck=true;
                res.send({
                    "message":result.data,
                    "bankCheck":bankCheck,
                     "status":true
                 })
            }
            else if(!docs){
                bankCheck=false;
                res.send({
                    "message":result.data,
                    "bankCheck":bankCheck,
                     "status":true
                 })
            }
        }).clone().catch(function(err){ return [err,false]});

        
        
   })
   .catch((err)=>{
    console.log(err)
    //    console.log(err)
    //    res.send({
    //        "message":err,
    //        "status":false
    //    })
    res.send(err)
       //res.status(403).send(err);
   })
})


Router.get('/activateusdtToken',async(req,res)=>{
    let result = await activate_token();
    // let result = await activateUSDTToken();
    res.send(result);
})

Router.get('/checkaddressvalidity',async (req,res)=>{
    let result = await CheckAddressValidity(req.body.address,req.body.type);
    
    res.send(result)
    // if(result.result[0].valid){

    //         res.send({'message':"Valid Address","address":result.result[0].address})

    // }
    // else{
    //     res.send({'message':"InValid Address","address":result.result[0].address})
    // }
    
})

Router.get('/cryptocompare',async (req,res)=>{
    let x = await crypomarketprice();

    res.json(x);
})

async function crypomarketprice(){
    let x = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=tether,bitcoin&order=market_cap_desc&per_page=100&page=1&sparkline=false',{
        headers:{
            'Content-Type':'application/json',
           
        }
    })
    .then(result=>{
        console.log(result.data)
       if(result.data){
        let BTCprice = parseFloat(result.data[0].current_price) - 150;
        let USDTprice = result.data[1].current_price
        return [true,BTCprice,USDTprice]
        
       }
       else{
        return [true,0,0]

       }
       
       
    })
    .catch(err=>{
        // console.log(err)
        return [false]
    })

    return x;
}


Router.post('/incoming/withdrwal/additional', (req,res)=>{
    console.log(req.body);

    res.sendStatus(200);

});

Router.get('/remove/address',async (req,res)=>{
    let update = await Usermodel.updateMany({},{ $set: { 'btc_wallet.0.address': '' } });
    if(update){
        res.send({
            "message":"done"
        })
    }
})




Router.post('/incoming/depositcallback', (req,res)=>{

    // res.sendStatus(200);
    // return false;
   
    console.log(req.body)
    if(req.headers['x-checksum'] !== "undefined" || req.headers['x-checksum'] !== "" ){

       
        
        // if(req.body.processing_state === 1){
        //     Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
        //         if(err){
        //             res.json({
        //                 'message':'An Error'+err,
        //                 'status':false
        //             })
        //         }
        //         if(docs){

        //         }
        //         else{
                    
        //             let status = 'Processing';
        //             let insert = await updateDepositStatus(req.body,status);
        //             // console.log('Deposit-Processing')
        //             if(insert[0]){
        //                 let saveNotificationx = await saveNotification(req.body,status)
        //             }

        //         }
        //     })
        // }
  
        if(req.body.processing_state === 2){
            console.log('I am here 1')
            
            Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                if(err){
                    res.json({
                        'message':err,
                        'status':false
                    })
                }
                if(docs){
                    let status = 'Transaction Completed';
                    
                    if(docs.processing_state !== "2"){
                       
                        await wallet_transactions.findOneAndUpdate({txtid:req.body.txid},{status:status,processing_state:req.body.processing_state,state:req.body.state,confirm_blocks:req.body.confirm_blocks}).exec();
                        let newAmount;
                        
                        if(req.body.currency === "BTC"){
                            newAmount = parseFloat(req.body.amount * 0.00000001).toFixed(8);
                        }
                        else if(req.body.currency === "TRX-USDT-TRC20"){
                            newAmount = parseFloat(req.body.amount * 0.000001).toFixed(6);
                        }
                        
                        let UpdateDepositAccount = await updateDepositStatusCallback(req.body.currency,req.body.to_address,newAmount);
                       
                        if(UpdateDepositAccount){

                            console.log('Update Processing')
                            
                            let saveNotificationCallbackx= await saveNotificationCallBack(req.body,status)
                          
                            await Usermodel.findOne({$or:[{'btc_wallet.address':req.body.to_address},{'usdt_wallet.address':req.body.to_address}]
                            },(err,docxc)=>{
                                if(err){
                                    
                                }
                                else if(docxc){
                                   
                                    successfulDeposit(docxc.email,docxc.username,req.body.currency,req.body.from_address,newAmount)
                                }
                            }).clone().catch(function(err){ return [err,false]});

                             res.sendStatus(200);
                        }
                        else{
                            let subject = "Failed Deposit Update onPremises"
                            await FailedUpdateEmail(req.body.to_address,req.body.txtid,subject,newAmount,req.body.currency);
                            res.sendStatus(200);
                        }
                        // console.log('Deposit-Completed2')

                    }
                    else if(docs.processing_state == "2"){
                        res.sendStatus(200);
                    }
                    
                }
                else{
                   
                    let status = 'Transaction Completed';
                    let insert = await updateDepositStatus(req.body,status);
                   
                    // if(insert[0]){
                    //     //NOtification
                    //     let saveNotificationx = await saveNotification(req.body,status)
                    // }

                    let newAmount;
                        
                    if(req.body.currency === "BTC"){
                        newAmount = parseFloat(req.body.amount * 0.00000001).toFixed(8);
                    }
                    else if(req.body.currency === "TRX-USDT-TRC20"){
                        newAmount = parseFloat(req.body.amount * 0.000001).toFixed(6);
                    }
                    
                    let UpdateDepositAccount = await updateDepositStatusCallback(req.body.currency,req.body.to_address,newAmount);
                    
                    if(UpdateDepositAccount){
                        console.log('Success')
                        let saveNotificationCallbackx= await saveNotificationCallBack(req.body,status)
                        await Usermodel.findOne({
                            $or:[
                                {
                                    'btc_wallet.address':req.body.to_address
                                },
                                {
                                    'usdt_wallet.address':req.body.to_address
                                }
                            ]
                        },(err,docxc)=>{
                            if(err){

                            }
                            else if(docxc){
                                successfulDeposit(docxc.email,docxc.username,req.body.currency,req.body.from_address,newAmount)
                                
                            }
                        }).clone().catch(function(err){ return [err,false]});

                        res.sendStatus(200);
                        
                        //res.sendStatus(200);
                    }
                    else{
                        let subject = "Failed Deposit Update onPremises"
                        await FailedUpdateEmail(req.body.to_address,req.body.txtid,subject,newAmount,req.body.currency);
                        res.sendStatus(200);
                    }
                    
                }
            })
            
        }
        if(req.body.processing_state === -1){
            Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                if(err){
                    res.json({
                        'message':err,
                        'status':false
                    })
                }
                else{
                    let status = "Transaction Failed";
                    await wallet_transactions.findOneAndUpdate({txtid:req.body.txid},{status:status,processing_state:req.body.processing_state,state:req.body.state,confirm_blocks:req.body.confirm_blocks}).exec();
                    let newAmount;
                        
                    if(req.body.currency === "BTC"){
                        newAmount = parseFloat(req.body.amount * 0.00000001).toFixed(8);
                    }
                    else if(req.body.currency === "TRX-USDT-TRC20"){
                        newAmount = parseFloat(req.body.amount * 0.000001).toFixed(6);
                    }
                    
                    let saveNotificationCallbackx= await saveNotificationCallBack(req.body,status)
                    
                }
            })
            res.sendStatus(200);
            
            
        }
    }
    else{
        
        console.log('Unverified Call On Deposit Webhook')
        res.sendStatus(200);
    }
   
})


async function updateDepositStatusCallback(currency,address,amount){
    let response =false
     if(currency === "BTC"){
        let filter = {'btc_wallet.address':address};
        let update = {$inc:{'btc_wallet.$.balance':parseFloat(amount)}}
         
        let updatedValue =  await Usermodel.findOneAndUpdate(filter, update);

          if(updatedValue){
            response=true
          }
        
    }
    else if(currency === "TRX-USDT-TRC20"){
        let filter = {'usdt_wallet.address':address};
        let update = {$inc:{'usdt_wallet.$.balance':parseFloat(amount)}}
        let updatedValue =  await Usermodel.findOneAndUpdate(filter, update);
          if(updatedValue){
            response=true
          }
    }

    return response;
}


Router.post('/incoming/withdrawalcallback',(req,res)=>{
    
    // res.sendStatus(200);
    // return false;

    if(req.headers['x-checksum'] !== "undefined" || req.headers['x-checksum'] !== "" ){
        console.log(req.body)
        let newAmount;
        // if(req.body.processing_state === 1){
        //     Walletmodel.findOne({order_id:req.body.order_id}, async function(err,docs){
        //         if(err){
        //             res.json({
        //                 'message':'An Error'+err,
        //                 'status':false
        //             })
        //         }
        //         if(docs){

        //         }
        //         else{
                   
        //             let status = "Processing"
        //             await wallet_transactions.findOneAndUpdate({order_id:req.body.order_id},{status:status,processing_state:req.body.processing_state,state:req.body.state,confirm_blocks:req.body.confirm_blocks}).exec();
                    
        //         }
        //     })
  
        // }
        if(req.body.processing_state === 2){

            Walletmodel.findOne({order_id:req.body.order_id},async function(err,docs){
                if(err){
                    res.json({
                        'message':err,
                        'status':false
                    })
                }
                if(docs){
                    if(docs.processing_state !== "2"){
                         let status = 'Transaction Completed';
                         let newAmount;
                         let currency;
                        
                         if(req.body.currency === "BTC"){
                             newAmount = parseFloat(req.body.amount * 0.00000001).toFixed(8);
                             
                         }
                         else if(req.body.currency === "TRX-USDT-TRC20"){
                             newAmount = parseFloat(req.body.amount * 0.000001).toFixed(6);
                         }
                         if(req.body.currency === "TRX-USDT-TRC20"){
                            currency = "USDT"
                         }
                         else{
                            currency = "BTC"
                         }
                         await wallet_transactions.findOneAndUpdate({order_id:req.body.order_id},{status:status,processing_state:req.body.processing_state,state:req.body.state,confirm_blocks:req.body.confirm_blocks}).exec();
                         await Notification.create({
                            type:2,
                            transfertype:'BlockChain',
                            asset:currency,
                            from_address:req.body.from_address,
                            to_address:req.body.to_address,
                            amount:newAmount,
                            status:status,
                            read:'unread',
                            initiator:'sender',
                            senderaddress:'',
                        })
                        res.sendStatus(200); 
                    }
                    
                }
                else{
                    res.sendStatus(200);
                }
            })
          
            
        }
        if(req.body.processing_state === -1){
            let status = 'Transaction Failed';
            Walletmodel.findOne({order_id:req.body.order_id},async function(err,docs){
                if(err){
                    res.json({
                        'message':err,
                        'status':false
                    })
                }
                else{
                    let newAmount;
                    let currency;
                   
                    if(req.body.currency === "BTC"){
                        newAmount = parseFloat(req.body.amount * 0.00000001).toFixed(8);
                    }
                    else if(req.body.currency === "TRX-USDT-TRC20"){
                        newAmount = parseFloat(req.body.amount * 0.000001).toFixed(6);
                    }
                    if(req.body.currency === "TRX-USDT-TRC20"){
                       currency = "USDT"
                    }
                    else{
                       currency = "BTC"
                    }

                    //await wallet_transactions.findOneAndUpdate({order_id:req.body.order_id},{status:status,processing_state:req.body.processing_state,state:req.body.state,confirm_blocks:req.body.confirm_blocks}).exec();
                    await Notification.create({
                        type:2,
                        transfertype:'BlockChain',
                        asset:currency,
                        from_address:req.body.from_address,
                        to_address:req.body.to_address,
                        amount:newAmount,
                        status:status,
                        read:'unread',
                        initiator:'sender',
                        senderaddress:'',
                    })
                }

            })
            res.sendStatus(200);
            
               
        }
    }
    else{
         
        console.log('Forbidden Outward Withdrawal Request WebHook')
    }
})

async function updateWithdrawalStatus(body,status){

    if(req.body.currency === "BTC"){
        newAmount = parseFloat(body.amount * 0.00000001).toFixed(8);
    }
    else if(req.body.currency === "TRX-USDT-TRC20"){
        newAmount = parseFloat(body.amount * 0.000001).toFixed(6);
    }

   
    let newCurrency;

    if(req.body.currency === "TRX-USDT-TRC20"){
        newCurrency="USDT";
    }
    else if(req.body.currency === "BTC"){
        newCurrency="BTC";
    }

    Notification.create({
        type:req.body.type,
        orderid:req.body.orderid,
        transfertype:'BlockChain Transfer',
        asset:newCurrency,
        from_address:req.body.from_address,
        to_address:req.body.to_address,
        amount:newAmount,
        status:status,
        read:'unread',
        initiator:'sender',
        date_created:new Date(),
        senderaddress:req.body.orderid,
        // senderaddress:req.body.from_address,
    })

}



Router.post('/check/customer/Address',middlewareVerify,async(req,res)=>{
    
    let receipentAddress = req.body.receipent_address;
    let wallet_type = req.body.wallet_type;
    // let jupitAddress = await checkJupitAddress(receipentAddress,wallet_type);
    let CheckAddressValidityVar = await CheckAddressValidity(receipentAddress,wallet_type);

    if(CheckAddressValidityVar[0] && CheckAddressValidityVar[1] ){
        // console.log('Hello',CheckAddressValidityVar)
        let jupitAddress = await JupitCustomerCheck(receipentAddress,wallet_type);
        
        if(jupitAddress.length > 0){
            res.send('Internal Transfer')
        }
        else{
            res.send('BlockChain Transfer')
        }
    }
    else{
        // console.log('Hello',CheckAddressValidityVar)
        res.status(403).send('Invalid Wallet Address');
    }
   
    
})



Router.post('/transfer/coin/',middlewareVerify,async(req,res)=>{
    const user_id = req.body.userid;
    const sender = req.body.senderaddress;
    const wallet_type = req.body.wallet_type;
    const amount = parseFloat(req.body.amount).toFixed(8);
    const recipentaddress = req.body.receipentaddress;
    const tranfertype = req.body.transfertype
    const networkFee = req.body.networkFee
    const block_average_fee = req.body.block_average;
    const charge = req.body.charge;
    let checkAddress;
    
    if(tranfertype === "Internal Transfer"){
        let newamount = 0;
        if(wallet_type === "BTC"){
           newamount = parseFloat(amount).toFixed(8);
           

        }
        else if(wallet_type === "USDT"){
            newamount = parseFloat(amount).toFixed(6);
           
        }

        let SubFundToWallet = await SubFund(user_id,newamount,wallet_type,block_average_fee,sender,recipentaddress);
                        
        if(SubFundToWallet){
            
            let AddFundToWallet = await AddFund(recipentaddress,newamount,wallet_type);
            if(AddFundToWallet){

               
                Notification.create({
                    type:12,
                    orderid:sender,
                    transfertype:tranfertype,
                    asset:wallet_type,
                    from_address:sender,
                    to_address:recipentaddress,
                    amount:newamount,
                    status:'Completed',
                    read:'unread',
                    initiator:'sender',
                    date_created:new Date(),
                    senderaddress:sender,
                })

               
                
                res.send({
                    "Message":'Transaction Was Successful',
                })
            }
            else{
               
                res.status(403).send({
                    "Message":"Internal Server Error AddFund"+ AddFundToWallet,
                    
                })
            }
        }
        else{
           
            res.status(403).send({
                "message":"Internal Server Error SendFund"+ SubFundToWallet,
                
            })
        }
    }
    else if(tranfertype === "BlockChain Transfer"){

        checkAddress = await checkJupitAddress(sender,wallet_type);

        if(checkAddress[1] && checkAddress[0] != "JupitCustomer"){
            res.status(403).send("Invalid Sender Wallet Address");
        }

        let fee = parseFloat(block_average_fee * 226 * 0.00000001 ).toFixed(8);
        let totalAmount  = parseFloat(networkFee) + parseFloat(amount);
        let totalAmount_with_Charges = parseFloat(networkFee) + parseFloat(amount) + parseFloat(charge)  
        let UpdateWalletBalances = await updateWalletBalance(user_id,parseFloat(totalAmount_with_Charges).toFixed(8),wallet_type,fee,sender,recipentaddress);
            console.log('UpdateWalletBalances',UpdateWalletBalances);
        if(UpdateWalletBalances){
            if(wallet_type === "BTC"){
                console.log('WalletType',wallet_type)
                let WalletCallback =  await creditWalletAddress(user_id,sender,recipentaddress,wallet_type,parseFloat(fee).toFixed(8),parseFloat(amount).toFixed(8),block_average_fee)
                if(WalletCallback[1]){
                  
                    Notification.create({
                        type:2,
                        orderid:WalletCallback[2],
                        transfertype:tranfertype,
                        asset:wallet_type,
                        from_address:sender,
                        to_address:recipentaddress,
                        amount:amount,
                        status:'Processing',
                        read:'unread',
                        initiator:'sender',
                        senderaddress:sender,
                    })

                    Walletmodel.create({
                        type:"Send",
                        order_id:WalletCallback[2],
                        currency:"BTC",
                        status:'Processing',
                        usdvalue:req.body.usdvalue,
                        nairavalue:req.body.nairavalue,
                        rateInnaira:req.body.rate,
                        initiator:req.body.email
                    });
                    cryptoledger.create({
                        
                        address:sender,
                        currency:"BTC",
                        amount:parseFloat(amount),
                        transaction_fee:charge,
                        type:'Send'
                    });

                    
                    
                    res.send({
                        "Message":"Transaction Initiated",
                        "Status":true
                    })
                }
                else{
                    
                    res.status(403).send("Internal Server Error..")
                    
                }
            }

            if(wallet_type === "USDT"){
               
                
                let WalletCallback =  await creditWalletAddressUSDT(user_id,sender,recipentaddress,wallet_type,parseFloat(fee).toFixed(8),parseFloat(amount).toFixed(8),networkFee)
                if(WalletCallback[1]){
                  
                    Notification.create({
                        type:2,
                        orderid:WalletCallback[2],
                        transfertype:tranfertype,
                        asset:wallet_type,
                        from_address:sender,
                        to_address:recipentaddress,
                        amount:amount,
                        status:'Processing',
                        read:'unread',
                        initiator:'sender',
                        senderaddress:sender,
                    })
                    Walletmodel.create({
                        type:"Send",
                        order_id:WalletCallback[2],
                        currency:"USDT",
                        status:'Processing',
                        usdvalue:req.body.usdvalue,
                        nairavalue:req.body.nairavalue,
                        rateInnaira:req.body.rate,
                        initiator:req.body.email,
                        state:"1",
                        confirm_block:"1",
                        processing_state:"1"
                    });
                    cryptoledger.create({
                        address:sender,
                        currency:"USDT",
                        amount:parseFloat(amount),
                        transaction_fee:charge,
                        type:'Send'
                    });
                    res.send({
                        "Message":"Transaction Initiated",
                        "Status":true
                    })
                }
                else{
                  
                    res.status(403).send("Internal Server Error..")
                   
                }
            }
            
        } 
        else{
            res.status(403).send("Internal Server Error.."+ UpdateWalletBalances)
            // res.json({
            //     "error":"InternalServerError...UpdateWallet "+ UpdateWalletBalances,
            //     "status":false,
            // })
        }

    }
    

})

Router.post('/notification/fetch/title',middlewareVerify,(req,res)=>{
    const addressBTC = req.body.addressBTC;
    const addressUSDT = req.body.addressUSDT;
    const userid = req.body.userid;
    const email= req.body.email;
    const virtual_account = req.body.virtual_account;
    //{$and:[{read:'unread'}]}
    // console.log(req.body)
    Notification.find({ 
        $and:[
            {

                $or: [
                    { from_address: req.body.addressBTC }, 
                    { to_address: req.body.addressBTC },
                    { to_address: req.body.virtual_account },
                    { from_address: req.body.addressUSDT }, 
                    { to_address: req.body.addressUSDT },
                    {initiator:req.body.email}
                ]

            },
            {
                "read":"unread"
            }

        ]

     },function(err,docs){
        if(err){
            // console.log(err)
            res.send({err});
        }
        else if(docs){
            //  console.log(docs)
            res.send(docs)
           
        }
        else{
            console.log('Not Found')
        }
    }).sort({date_created:-1})

})


Router.post('/notification/fetch',middlewareVerify,(req,res)=>{
    const addressBTC = req.body.addressBTC;
    const addressUSDT = req.body.addressUSDT;
    const userid = req.body.userid;
    const email= req.body.email;
    const virtual_account = req.body.virtual_account
    //{$and:[{read:'unread'}]}
    Notification.find({ 
        $and:[
            {

                $or: [
                    { from_address: addressBTC }, 
                    { to_address: addressBTC },
                    { to_address: virtual_account },
                    { from_address: addressUSDT }, 
                    { to_address: addressUSDT },
                    {initiator:req.body.email}
                ]

            }

        ]

     },function(err,docs){
        if(err){
            res.send({err});
        }
        else if(docs){
            
            res.send(docs)
           
        }
    }).limit(10).sort({updated: -1})

})



Router.post('/notification/details',middlewareVerify,(req,res)=>{
    Notification.findOne({_id:req.body.userid},function(err,docs){
        if(err){
            res.status(403).send(err)
        }
        else if(docs){
            res.send(docs)
        }
    })
})

Router.post('/test/update', async (req,res)=>{

    let userid = "6388b64884f97d934901bac6";

    let updateValue =  await Usermodel.findByIdAndUpdate(userid,{$set:{'btc_wallet':{'address':"0000"}}},function(err,docs){
        if(err){
            res.send(err)
        }
        else if(docs){
            res.send(docs)
        }
        else if(!docs){
            res.send("Not found")
        }
    }).clone().catch(function(err){ return [err,false]});
    
   
    
    // const balance = req.body.balance;
    // const id = req.body.userid;
    // console.log(parseFloat(balance).toFixed(8))
    // const update = { balance:parseFloat(balance).toFixed(8) };
//    let x =  Usermodel.findByIdAndUpdate(id,update,{new: true,
//         upsert: true,
//         rawResult: true // Return the raw result from the MongoDB driver
//     });
//     res.json(x)


})

Router.post('/transfer/asset',middlewareVerify,(req,res)=>{
    const userid = req.body.userid;
    const wallets_type = req.body.wallet_type;
    const auto_fee = req.body.auto_fee;
    const amount = req.body.amount;
    const recipentAddress = req.body.recipentaddress;
    const block_average_fee = req.body.block_average
    
    // console.log(recipentAddress);
    // res.json({
    //     recipentAddress
    // })
    // return false;
   let User =  Usermodel.findById({_id:userid},async function(err,docs){
        if(err){
            res.send({
                "message":err.data,
                "status":false
            })
        }
        if(docs){
            
            if(wallets_type === "BTC"){
                // let getBlockFee = await getautofee();
                
                // if(getBlockFee){
                //     res.send({
                //         getBlockFee
                //     })
                // }
                // else{
                //     res.send({
                //         "errror":getBlockFee
                //     })
                // }
                //1 UTXO vin and 2 UTXOs vout = 148+34*2+10(header) = 226 bytes
                //2 UXTO vin and 2 UTXOs vout = 2*148 + 34*2 +10(header) = 374 bytes
                // return false;
                let fee = parseFloat(auto_fee * 226 * 0.00000001 ).toFixed(8);
                let totalAmount  = parseFloat(fee + amount).toFixed(8)
                // console.log(totalAmount)
                
                if(docs.btc_wallet[0].balance > totalAmount ){
                    
                    let jupitAddress = await checkJupitAddress(recipentAddress,wallets_type);
                    
                    if(jupitAddress[1]){
                        if(jupitAddress[0]=== "JupitCustomer"){
                            let SubFundToWallet = await SubFund(docs._id,parseFloat(amount).toFixed(8),wallets_type,fee,docs.btc_wallet[0].address,recipentAddress);
                            
                            // console.log('SubFundWallet',SubFundToWallet)
                            
                            if(SubFundToWallet){
                                // console.log('SubFundWalletII',SubFundToWallet)
                                let AddFundToWallet = await AddFund(recipentAddress,parseFloat(amount).toFixed(8));
                                // console.log(AddFundToWallet)
                                if(AddFundToWallet[0]){
                                    res.json({
                                        "Message":'Transaction Was Successful',
                                        "Status":true
                                    })
                                }
                                else{
                                    res.json({
                                        "error":'Internal Server Error' + SubFundToWallet,
                                        "Status":false
                                    })
                                }
                            }
                            else{
                                res.json({
                                    "error":'Internal Server Error'+ SubFundToWallet,
                                    "Status":false
                                })
                            }

                           
                            
                        
                        }
                        else{
                            let UpdateWalletBalances = await updateWalletBalance(docs._id,parseFloat(totalAmount).toFixed(8),wallets_type,fee,docs.btc_wallet[0].address,recipentAddress);
                            if(UpdateWalletBalances){
                                let WalletCallback =  await creditWalletAddress(docs._id,docs.btc_wallet[0].address,recipentAddress,wallets_type,parseFloat(fee).toFixed(8),parseFloat(amount).toFixed(8),block_average_fee)
                                if(WalletCallback[1]){
                                    res.json({
                                        "Message":WalletCallback[0],
                                        "Status":true
                                    })
                                }
                                else{
                                    res.json({
                                        "Message":WalletCallback[0],
                                        "Status":false
                                    })
                                }
                            
                            
                            } 
                            else{
                                res.json({
                                    "error":"InternalServerError...UpdateWallet "+ UpdateWalletBalances,
                                    "status":false,
                                })
                            }

                           
                                
                        }
                    }
                    
                   
                       
                }
                else{
                    res.json({
                        "message":'Insufficent Balance'+docs.btc_wallet[0].balance,

                        "Status":false
                    })
                }
               
                
            }
            if(wallets_type === "USDT"){
                let fee = parseFloat(auto_fee * 0.00000032).toFixed(6);
                let totalAmount  = parseFloat(fee) + parseFloat(amount).toFixed(6);
                if(parseFloat(totalAmount).toFixed(6) > docs.usdt_wallet[0].balance ){
                    let callback = creditWalletAddress(docs._id,docs.usdt_wallet[0].address,recipentAddress,wallets_type,parseFloat(fee).toFixed(6),parseFloat(amount).toFixed(6),block_average_fee)
                    res.send(callback);
                }
                else{
                    res.json({
                        "message":'Insufficent Balance',
                        "Status":false
                    })
                }
                
            }
            
            
        }
        else{
            res.send({
                "message":"Userid not Found",
                "status":false
            })
        }
    })

    
});

Router.post('/update/read',middlewareVerify,(req,res)=>{
    
    let data = false
    req.body.forEach(d=>{
        Notification.findByIdAndUpdate(d,{"read":"read"},function(err,result){
            if(err){
                // console.log('MyError',err);
                res.status(403).send(err)

            }
        })
    })

    res.send('Updated');


})

Router.post('/updateWallet',async (req,res)=>{
    let amount = req.body.amount;
    let user_id = req.body.user
    console.log(req.body)
    let SubFunds = await Usermodel.findById(user_id, async function(err,docs){
        if(err){
            res.send(err)
        }
        else if(docs){
            let oldValue = docs.btc_wallet[0].balance;
            console.log('Decimal128Converted',oldValue.toString())
            let newValue = parseFloat(parseFloat(oldValue.toString()) - parseFloat(amount)).toFixed(7) 
            
            let updateValue =  await Usermodel.findByIdAndUpdate(user_id,{$set:{'btc_wallet':{'balance':newValue}}},function(err,docs){
                if(err){
                        return [err,false]
                }
                else{
                    return ['updated',docs,true]
                }
            }).clone().catch(function(err){ return [err,false]});

            res.send(updateValue)
            
            // res.send({
            //     "oldValue":oldValue,
            //     "newValue":newValue

            // })
        }
    }).clone().catch(function(err){ return [err,false]});
    
})

async function creditWalletAddress(userid,address,recipentAddress,wallet_type,auto_fee,amount,block_average_fee){
    
    let isTrue ;
    // let secret="3QdPXcmt7RYeMKBQy9eM281N7gMD";
    // let apikey = "N5zrXLSLpfbxC3BX";
    // let wallet_id="678693"

    // let secret="2ARcpQugmy52KMHRm6bCn2jRWZA9";
    // let apikey = "4XoSQPfLwbUiyvF5i";
    // let wallet_id="127771"

    let secret= THRESHOLD_BTC_API_SECRET_MASS_SENDER
    let apikey = THRESHOLD_BTC_API_TOKEN_MASS_SENDER;
    let wallet_id= THRESHOLD_BTC_WALLET_ID_MASS_SENDER
   
    

    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    function build(params, secret, t, r, postData) {
        const p = params || [];
        p.push(`t=${t}`, `r=${r}`);
        if (!!postData) {
            if (typeof postData === 'string') {
                    p.push(postData);
            } else {
                    p.push(JSON.stringify(postData));
            }
        }
        p.sort();
        p.push(`secret=${secret}`);
        return crypto.createHash('sha256').update(p.join('&')).digest('hex');
    }

    // var secret="44bJugkgbvhzqaMiQ3inE8Hebeka";
    var time = Math.floor(new Date().getTime() / 1000);
    var generate_order_id = generateuuID();
   
    // console.log('AutoFee',auto_fee);
    // var newauto_fee = parseInt(auto_fee / 0.00000001);
    
    // console.log('newAuto',newauto_fee)
    // "order_id": "187795_"+generate_order_id,
   
    var params = {
        "requests": [
          {
            "order_id": "804173_"+generate_order_id,
            "address": recipentAddress,
            "amount": amount,
            "memo": address,
            "user_id": userid,
            "message": "message-"+userid,
            "block_average_fee": block_average_fee
            
          },
       
        ],
        "ignore_black_list": false
      }
    

    var CHECKSUM = build(null,secret,time,rand,params);

    console.log('CheckSum',CHECKSUM);
      
    const parameters = {
        t:time,
        r:rand,
    }
 
    const get_request_args = querystring.stringify(parameters);
   
    const url = `https://vault.thresh0ld.com/v1/sofa/wallets/${wallet_id}/sender/transactions?`+ get_request_args
    
   
   let myAxios = await axios.post(url,params,{
        headers: {
            'Content-Type': 'application/json',
            // 'X-API-CODE':'4W1Pg2CeHQMS8hHGr',
            'X-API-CODE':apikey,
            'X-CHECKSUM':CHECKSUM,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
   })
   .then((result)=>{
        console.log(result)
        return([result.data,true,generate_order_id]) 
   })
   .catch((err)=>{
     console.log(err.response)
    return [err.response.data,false]
    
    
    
   });

   return myAxios;
   
   
   
}


async function creditWalletAddressUSDT(userid,address,recipentAddress,wallet_type,auto_fee,amount,networkFee){
    
    let isTrue ;
   
    // let secret="3EXdWbtVAiMb5BGVF7utbXnCDGb2";
    // let  apikey="WtjgBd7JbpeBTHCF"
    // let wallet_id="201075"
    
    let secret= THRESHOLD_USDT_API_SECRET_MASSCOLLECTION
    let apikey = THRESHOLD_USDT_API_TOKEN_MASSCOLLECTION;
    let wallet_id= THRESHOLD_USDT_WALLET_ID_MASSCOLLECTION


    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    function build(params, secret, t, r, postData) {
        const p = params || [];
        p.push(`t=${t}`, `r=${r}`);
        if (!!postData) {
            if (typeof postData === 'string') {
                    p.push(postData);
            } else {
                    p.push(JSON.stringify(postData));
            }
        }
        p.sort();
        p.push(`secret=${secret}`);
        return crypto.createHash('sha256').update(p.join('&')).digest('hex');
    }

    // var secret="44bJugkgbvhzqaMiQ3inE8Hebeka";
    var time = Math.floor(new Date().getTime() / 1000);
    var generate_order_id = generateuuID();
   
    
   
    var params = {
        "requests": [
          {
            "order_id": "804173_"+generate_order_id,
            "address": recipentAddress,
            "amount": amount,
            "memo": address,
            "user_id": userid,
            "message": "message-"+userid,
            "auto_fee": networkFee
            
          },
       
        ],
        "ignore_black_list": false
      }
    

    var CHECKSUM = build(null,secret,time,rand,params);

      
    const parameters = {
        t:time,
        r:rand,
    }
 
    const get_request_args = querystring.stringify(parameters);
   
    const url = `https://vault.thresh0ld.com/v1/sofa/wallets/${wallet_id}/sender/transactions?`+ get_request_args
    
   
   let myAxios = await axios.post(url,params,{
        headers: {
            'Content-Type': 'application/json',
            // 'X-API-CODE':'4W1Pg2CeHQMS8hHGr',
            'X-API-CODE':apikey,
            'X-CHECKSUM':CHECKSUM,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
   })
   .then((result)=>{
    
        return([result.data,true,"804173_"+generate_order_id])
        
   })
   .catch((err)=>{
 
    return [err.response.data,false]

    
   });

   return myAxios;
   
  
}



function generateuuID(){
    return randomUUID(); 
}



async function checkJupitAddress(address,wallet_type){
    const addrr = [];
    let secret="";
    let apikey="";
    let wallet_id=""
    if(wallet_type === "BTC"){

         secret= THRESHOLD_BTC_API_SECRET_MASSCOLLECTION
         apikey = THRESHOLD_BTC_API_TOKEN_MASSCOLLECTION;
         wallet_id= THRESHOLD_BTC_WALLET_ID_MASSCOLLECTION

        // secret="3A84eebqYqeU3HaaXMcEAip8zBRS";
        // apikey = "4PiVpdbyLJZatLBwR";
    }
    else if(wallet_type === "USDT"){
        // secret="3EXdWbtVAiMb5BGVF7utbXnCDGb2";
        // apikey = "WtjgBd7JbpeBTHCF";
         secret= THRESHOLD_USDT_API_SECRET_MASSCOLLECTION
         apikey = THRESHOLD_USDT_API_TOKEN_MASSCOLLECTION;
         wallet_id= THRESHOLD_USDT_WALLET_ID_MASSCOLLECTION
    }
    else{
        return ["Invalid Wallet Type",false]
    }
    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    function build(params, secret, t, r, postData) {
        const p = params || [];
        p.push(`t=${t}`, `r=${r}`);
        if (!!postData) {
            if (typeof postData === 'string') {
                    p.push(postData);
            } else {
                    p.push(JSON.stringify(postData));
            }
        }
        p.sort();
        p.push(`secret=${secret}`);
        return crypto.createHash('sha256').update(p.join('&')).digest('hex');
    }

    var time = Math.floor(new Date().getTime() / 1000);
    var CHECKSUM = build(null,secret,time,rand,null);

      
    const parameters = {
        t:time,
        r:rand,
    }
 
    const get_request_args = querystring.stringify(parameters);
   
    const url = `https://vault.thresh0ld.com/v1/sofa/wallets/${wallet_id}/addresses?`+ get_request_args
    
   
   let check = await axios.get(url,{
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':apikey,
            'X-CHECKSUM':CHECKSUM,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
   })
   .then((result)=>{
        // console.log(result.data)
        // return([result.data,true])  
        result.data.wallet_address.forEach((d)=>{
            addrr.push(d.address);
        })
        // return ([addrr,true])
        
        if(addrr.includes(address)){
           
            return (['JupitCustomer',true]);
        }
        else{
           
            return (['Non-JupitCustomer',true]);
        }
        
   })
   .catch((err)=>{
    
    return [err.response.data,false]
    
   });

   return check;
  
}

async function CheckAddressValidity (address,walletType){
        let secret = ""
        let Api=""
        let walletId="";

        if(walletType === "BTC"){
            // secret = "2awjZJeeVhtG23tepAzv5tcMYYN";
            // Api="55JbxSP6xosFTkFvg";
            // walletId ="194071"

            secret = THRESHOLD_BTC_API_SECRET_MASSCOLLECTION;
            Api= THRESHOLD_BTC_API_TOKEN_MASSCOLLECTION;
            walletId = THRESHOLD_BTC_WALLET_ID_MASSCOLLECTION
            
        }
        else if(walletType === "USDT"){
            // Api="WtjgBd7JbpeBTHCF";
            // secret = "3EXdWbtVAiMb5BGVF7utbXnCDGb2";
            // walletId="488433"

            secret = THRESHOLD_USDT_API_SECRET_MASSCOLLECTION;
            Api= THRESHOLD_USDT_API_TOKEN_MASSCOLLECTION;
            walletId = THRESHOLD_USDT_WALLET_ID_MASSCOLLECTION

        }

    let rand = random(option_rand);
        var option_rand = {
                min: 48886
                , max: 67889
                , integer: true
            }
    function buildChecksum(params, secret, t, r, postData) {
        const p = params || [];
        p.push(`t=${t}`, `r=${r}`);
        if (!!postData) {
            if (typeof postData === 'string') {
                    p.push(postData);
            } else {
                    p.push(JSON.stringify(postData));
            }
        }
        p.sort();
        p.push(`secret=${secret}`);
        return crypto.createHash('sha256').update(p.join('&')).digest('hex');
    }



    // var secret="3A84eebqYqeU3HaaXMcEAip8zBRS";
    var time = Math.floor(new Date().getTime() / 1000)
    var postData={
        "address":address
    }
    const params = {
        "addresses": [
            address
        ]
    }

    var build = buildChecksum(null,secret,time,rand,params);


        const parameters = {
            t:time,
            r:rand,
        }
        const get_request_args = querystring.stringify(parameters);
        
        const url = `https://vault.thresh0ld.com/v1/sofa/wallets/${walletId}/addresses/verify?`+get_request_args

        
    let x =  await axios.post(url,params,{ 
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':Api,
            'X-CHECKSUM':build,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
    })
    .then(res=>{
        // console.log('Data',res.data)
        // console.log('Data',res.data.result[0].valid)
        return[true,res.data.result[0].valid]
       
    })
    .catch((error)=>{
        // console.log('Error',error)
        return [false,error.response? error.response.data.message: 'No Connection' ]
    })
    return x;
}


async function AddFund(receipentAddress,amount,wallet_type){



        if(wallet_type === "BTC"){
            let AddFund = await Usermodel.findOneAndUpdate({'btc_wallet.address':receipentAddress},{$inc:{'btc_wallet.$.balance':amount}}).exec();
            if(AddFund){
                return [true,'FundAdded'];
            }
            else{
                return [false,'Failed'];
            }
        }
        else if(wallet_type === "USDT"){
            let AddFund = await Usermodel.findOneAndUpdate({'usdt_wallet.address':receipentAddress},{$inc:{'usdt_wallet.$.balance':amount}}).exec();
            if(AddFund){
                return [true,'FundAdded'];
            }
            else{
                return [false,'Failed'];
            }
        
        }

        return [false, 'InternalServerError']
    

}



async function updateWalletBalance(user_id,amount,wallet_type,auto_fee,fromAddress,toAddress){
    // console.log('USER_ID',user_id);
    // console.log('amount',amount);
    // console.log('currency',currency);
    // console.log('auto_fee',auto_fee);
    // console.log('fromAddresss',fromAddress);
    // console.log('toAddress',toAddress);
   
           
    let SubFunds = await Usermodel.findById(user_id, async function(err,docs){
                if(err){
                    return [err,false]
                }
                else if(docs){

                    if(wallet_type === "BTC"){
                        let oldValue = docs.btc_wallet[0].balance;
                        let newValue = parseFloat(parseFloat(oldValue.toString()) - parseFloat(amount)).toFixed(7)
                        console.log(newValue)

                        let updateValue =  await Usermodel.findByIdAndUpdate(user_id,{$set:{'btc_wallet':{'balance':newValue}}},function(err,docs){
                            if(err){
                                return [err,false]
                            }
                            else if(docs){
                                return ['updated',docs,true]
                            }
                            else if(!docs){
                                return ['Failed',false]
                            }
                        }).clone().catch(function(err){ return [err,false]});
                    }
                    else if(wallet_type === "USDT"){
                            
                            let oldValue = docs.btc_wallet[0].balance;
                            let newValue = parseFloat(parseFloat(oldValue.toString()) - parseFloat(amount)).toFixed(7)
                            //let newValue =   parseFloat(oldValue) - parseFloat(amount);
                            let updateValue =  await Usermodel.findByIdAndUpdate(user_id,{$set:{'usdt_wallet':{'balance':newValue}}},function(err,docs){
                                if(err){
                                        return [err,false]
                                }
                                else{
                                    return ['updated',true]
                                }
                        }).clone().catch(function(err){ return [err,false]});
                    }
                    
                    
                }
            }).clone().catch(function(err){ return [err,false]});
           
           
            if(SubFunds){
               
        
                return['updated',true]
        
            }
            else{
                return['Internal Server Error...UpdateWallet',true]
            }
     
    return transactionSub;
}

Router.post('/checkwalletaddress',async (req,res)=>{
    let body = req.body
    
    let userid = body.userid
    await Usermodel.findOne({_id:userid},async(err,docs)=>{
        if(err){
            res.send({
                "message":"Wallet Address Failed..pls logout and relogin",
                "status":false
            })
        }
        else if(docs){
           
            let checkAddress,checkbackup;
            if(body.wallet_type == "BTC"){
                checkAddress = await checkJupitAddress(docs.btc_wallet[0].address,body.wallet_type);
            }
            else if(body.wallet_type == "USDT"){
                checkAddress = await checkJupitAddress(docs.usdt_wallet[0].address,body.wallet_type);
            }
            

            if(checkAddress[1]){
                if(checkAddress[0] == "JupitCustomer" ){
                    res.send({
                        "message":"successss",
                        "wallet_address":docs.btc_wallet[0].address,
                        "status":true
                    })
                }
                else{

                    if(body.wallet_type == "BTC"){
                        checkbackup = await checkJupitAddress(docs.backup,body.wallet_type);

                        if(checkbackup[1] &&  checkbackup[0] == "JupitCustomer"){
                            await Usermodel.findOneAndUpdate({_id:userid},{$set:{'btc_wallet.0.address':docs.backup}}).exec();
                            res.send({
                                "message":"successss",
                                "wallet_address":docs.backup,
                                "status":true
                            })
                        }
                        else{
                            res.send({
                                "message":"failed",
                                "status":false
                            })
                        }
                    }
                    else{
                        res.send({
                            "message":"failed",
                            "status":false
                        })
                    }
                    
                    
                    
                }
            }
            else{
                res.send({
                    "message":"failed",
                    "status":false
                })
            }

        }
        else if(!docs){
            res.send({
                "message":"failed",
                "status":false
            })
        }

    }).clone().catch(function(err){ return [err,false]});
   
    
})

Router.get("/rate",(req,res)=>{
    rate.findOne({initialization:'JupitRateBard'},(err,docs)=>{
        res.send(docs.usdt[1]);
    })
})

Router.get("/rate/btc",(req,res)=>{
    rate.findOne({initialization:'JupitRateBard'},(err,docs)=>{
        res.send(docs.btc[0].sell);
    })
})



Router.post('/update/phonenumber',middlewareVerify,async(req,res)=>{
let userid = req.body.userid;
let phonenumber = req.body.newphonenumber;

    Usermodel.findOne({phonenumber:phonenumber},async (err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else if(docs){
            res.status(400).send('Phonenumber Already In Use');
        }
        else if(!docs){
            let update = await Usermodel.findOneAndUpdate({_id:userid},{'phonenumber':phonenumber}).exec()

            if(update){
                res.send('Phonenumber Successfully Updated');
            }
            else{
                res.status(400).send('Update Error');
            }
        }
    })



})



async function SubFund(user_id,amount,wallet_type,auto_fee,fromAddress,toAddress){
    
    if(wallet_type === "BTC"){
        let transactionSub =  await Usermodel.findOne({'btc_wallet.address':toAddress},async function(err,docs){
            if(err){
                
                return [err,false];
            }
            else if(docs){
                
                let SubFunds = await Usermodel.findById(user_id, async function(err,docs){
                    if(err){
                        return [err,false]
                    }
                    else{
                        
                        let oldValue = docs.btc_wallet[0].balance;
                        let newValue 
                        if(parseFloat(oldValue) > 0){
                            newValue =   parseFloat(oldValue) - parseFloat(amount);
                        }
                        else{
                            newValue =   0;
                        }
                        
                        // console.log('oldValue',oldValue);
                        
                        // console.log('newValue',newValue);
                       let updateValue =  await Usermodel.findByIdAndUpdate(user_id,{$set:{'btc_wallet':{'balance':parseFloat(newValue).toFixed(8),'address':fromAddress}}},function(err,docs){
                           if(err){
                                return [err,false]
                           }
                           else if(docs){
                            return ['updated',true]
                           }
                           else{
                            return ['Empty',false]
                           }
                       }).clone().catch(function(err){ return [err,false]});
                        
                    }
                }).clone().catch(function(err){ return [err,false]});
               
                //  let SubFunds = await Usermodel.findByIdAndUpdate(user_id, {$inc: { 
                //     btc_wallet: [{ 
                //           balance: parseFloat(amount), 
                           
                //     }] 
                //  }},function(err){
                //     if(err,docs){
                //         console.log(err)
                //     }
                //     else{
                //         console.log(docs)
                //     }
                //  }).clone().catch(function(err){ return [err,false]});
                
                
                let transaction_id = generateuuID();
                if(SubFunds){
                    try{
                        let wallet = wallet_transactions.create({
                            type:'Internal Transfer',
                            serial:user_id,
                            order_id:user_id,
                            currency:wallet_type,
                            txtid:transaction_id,
                            amount:amount,
                            fees:auto_fee,
                            from_address:fromAddress,
                            to_address:toAddress,
                            wallet_id:'MassSender'+user_id,
                            state: "null",
                            confirm_blocks:"null",
                            processing_state:"null",
                            read:"unread",
                            date_created:new Date(),
                            status:'Transaction Completed'
                    
                        })
            
                        return['success',true]
            
                    }
                    catch(err){
                        return [err,false]
                    }
                    
                }
            }
        }).clone().catch(function(err){ return [err,false]});
        
        return transactionSub;
    }
    else if(wallet_type === "USDT"){
        let transactionSub =  await Usermodel.findOne({'usdt_wallet.address':toAddress},async function(err,docs){
            if(err){
                
                return [err,false];
            }
            else if(docs){
                
                let SubFunds = await Usermodel.findById(user_id, async function(err,docs){
                    if(err){
                        return [err,false]
                    }
                    else{
                        
                        let oldValue = docs.usdt_wallet[0].balance;
                        let newValue 
                        if(parseFloat(oldValue) > 0){
                            newValue =   parseFloat(oldValue) - parseFloat(amount);
                        }
                        else{
                            newValue =   0;
                        }
                        
                       let updateValue =  await Usermodel.findByIdAndUpdate(user_id,{$set:{'usdt_wallet':{'balance':parseFloat(newValue).toFixed(8),'address':fromAddress}}},function(err,docs){
                           if(err){
                                return [err,false]
                           }
                           else if(docs){
                            return ['updated',true]
                           }
                           else{
                            return ['Empty',false]
                           }
                       }).clone().catch(function(err){ return [err,false]});
                        
                    }
                }).clone().catch(function(err){ return [err,false]});
               
                //  let SubFunds = await Usermodel.findByIdAndUpdate(user_id, {$inc: { 
                //     btc_wallet: [{ 
                //           balance: parseFloat(amount), 
                           
                //     }] 
                //  }},function(err){
                //     if(err,docs){
                //         console.log(err)
                //     }
                //     else{
                //         console.log(docs)
                //     }
                //  }).clone().catch(function(err){ return [err,false]});
                
                
                let transaction_id = generateuuID();
                if(SubFunds){
                    try{
                        let wallet = wallet_transactions.create({
                            type:'Internal Transfer',
                            serial:user_id,
                            order_id:user_id,
                            currency:wallet_type,
                            txtid:transaction_id,
                            amount:amount,
                            fees:auto_fee,
                            from_address:fromAddress,
                            to_address:toAddress,
                            wallet_id:'MassSender'+user_id,
                            state: "null",
                            confirm_blocks:"null",
                            processing_state:"null",
                            read:"unread",
                            date_created:new Date(),
                            status:'Transaction Completed'
                    
                        })
            
                        return['success',true]
            
                    }
                    catch(err){
                        return [err,false]
                    }
                    
                }
            }
        }).clone().catch(function(err){ return [err,false]});
        
        return transactionSub;
    }
    
}


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
       res.sendStatus(403);
       return false;
    }
    else{
       
        let decodedJwt = await parseJwt(bearerHeader);
      
        if(!decodedJwt){
            res.status(403).send({"message":"Forbidden Request."});
            return false;
        }
        if(decodedJwt){
            const expiration = new Date(decodedJwt.exp * 1000);
            const now = new Date();
            const Oneminute = 1000 * 60 * 1;
            if( expiration.getTime() - now.getTime() < Oneminute ){
               res.status(403).send('Token Expired');
               return false;
                
            }
            else{

                Usermodel.findOne({email:decodedJwt.user.email},(err,docs)=>{
                    if(err){
                         res.status(403).send({"message":"Internal Server Error"});
                         return false;
                    } 
                    else if(docs){
                         if(docs.password != decodedJwt.user.password ){
                            res.status(403).send("Password Expired");
                            return false;
                         }
                         if(docs.Status != "Active"){
                            res.status(403).send("Account Blocked");
                            return false;
                         }
                    }
                    else if(!docs){
                         res.status(403).send({"message":"Internal Server Error"});
                         return false;
                    }
                 })

            }
            
            
        }
        
        req.token = bearerHeader;
        next();
        
  
    }
}


async function JupitCustomerCheck(addr,wallet){
    // console.log('wallet_type',wallet)
    let result = [];
    if(wallet === "BTC"){
        return  await Usermodel.find({'btc_wallet.address':addr},function(err,docs){
            if(err){
                return [err]
            }
            else if(docs.length > 0){
                return [docs]
            }
            else{
                return [docs];
            }
        }).clone();
    }
    else if(wallet === "USDT"){
        return  await Usermodel.find({'usdt_wallet.address':addr},function(err,docs){
            if(err){
                return [err]
            }
            else if(docs.length > 0){
                return [docs]
            }
            else{
                return [docs];
            }
        }).clone();
    }
    
    
    
}

async function activate_token(){
    

let rand = random(option_rand);
var option_rand = {
        min: 48886
        , max: 67889
        , integer: true
    }

function buildChecksum(params, secret, t, r, postData) {
const p = params || [];
p.push(`t=${t}`, `r=${r}`);
if (!!postData) {
      if (typeof postData === 'string') {
            p.push(postData);
      } else {
            p.push(JSON.stringify(postData));
      }
}
p.sort();
p.push(`secret=${secret}`);
return crypto.createHash('sha256').update(p.join('&')).digest('hex');
}
var secret="3xhwE4xyFsYvg6iyok6RVEW32nvm";
// var rand = "Ademilola2@";

var timestamp = Math.floor(new Date().getTime() / 1000);
var time = timestamp - 240;
console.log(time)
var params="";
var postData=""
const parameters = {
  t:time,
  r:rand
}

var build = buildChecksum(null,secret,time,rand,null);

const get_request_args = querystring.stringify(parameters);
//https://vault.thresh0ld.com/v1/sofa
const options = {
  hostname: 'vault.thresh0ld.com',
  path: '/v1/sofa/wallets/870727/apisecret/activate?'+ get_request_args,
  method: 'POST',
  headers: {
        'Content-Type': 'application/json',
        'X-API-CODE':'2JgrSbJpctYdVHqVT',
        'X-CHECKSUM':build,
        'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
      }
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)
  

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()
}

async function activateUSDTToken(){
    let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
   
    function buildChecksum(params, secret, t, r, postData) {
        const p = params || [];
        p.push(`t=${t}`, `r=${r}`);
        if (!!postData) {
            if (typeof postData === 'string') {
                    p.push(postData);
            } else {
                    p.push(JSON.stringify(postData));
            }
        }
        p.sort();
        p.push(`secret=${secret}`);
        return crypto.createHash('sha256').update(p.join('&')).digest('hex');
    }
    var secret="28QadEbch82EbXFDU2sf771M8Qnv";
    // var rand = "Ademilola2@";
    // var time = Math.floor(new Date().getTime() / 1000)
    var time = Math.floor(Date.now() / 1000)
    var params="";
    var postData="";

    var build = buildChecksum(null,secret,time,rand,null);

    const parameters = {
        t:time,
        r:rand,
    }
    const get_request_args = querystring.stringify(parameters);
    
    
    const url = 'https://vault.thresh0ld.com/v1/sofa/wallets/488433/apisecret/activate?'+get_request_args

    let axiosCallback = await axios.post(url,params,{ 
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':'3NxBbdeL3vGtSfWTa',
            'X-CHECKSUM':build,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
        })
        .then(res=>{
            // console.log(res.data)
            return [res.data]
        })
        .catch((error)=>{
        // console.log('Error',error.response)
        return [error.response.data]

    })

    return axiosCallback;


}





async function successfulDeposit(email,username,currency,address,amount){

    // const mailData = {
    //     from: 'Jupit<hello@jupitapp.co>',  // sender address
    //     to: email, 
        
    //     text: 'That was easy!',
    //     html: `
        
                   
    //         `
    //   };

      let data = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
        <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
        <title></title>
        
          <style type="text/css">
            @media only screen and (min-width: 620px) {
        .u-row {
          width: 600px !important;
        }
        .u-row .u-col {
          vertical-align: top;
        }
      
        .u-row .u-col-100 {
          width: 600px !important;
        }
      
      }
      
      @media (max-width: 620px) {
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
        .u-col > div {
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
      
      table, td { color: #000000; } a { color: #0000ee; text-decoration: underline; }
          </style>
        
        
      
      <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Raleway:400,700" rel="stylesheet" type="text/css"><!--<![endif]-->
      
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
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
            
      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 1px solid #e9e9e9;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
        <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
        <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 1px solid #e9e9e9;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
        
      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
              
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 0px;padding-left: 0px;" align="center">
            
            <img align="center" border="0" src="https://assets.unlayer.com/projects/90767/1658238821901-JUPIT-Logo-Wordmark_1.png" alt="" title="" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 30%;max-width: 174px;" width="174"/>
            
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
            <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
              
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 0px;padding-left: 0px;" align="center">
            
            <img align="center" border="0" src="https://cdn.templates.unlayer.com/assets/1635863849995-ref.jpg" alt="Hero Image" title="Hero Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 600px;" width="600"/>
            
          </td>
        </tr>
      </table>
      
            </td>
          </tr>
        </tbody>
      </table>
      
        <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
        </div>
      </div>
      <!--[if (mso)|(IE)]></td><![endif]-->
            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
            
      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
        <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
        <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
        
      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:arial,helvetica,sans-serif;" align="left">
              
        <h1 style="margin: 0px; line-height: 140%; text-align: center; word-wrap: break-word; font-weight: normal; font-family: arial,helvetica,sans-serif; font-size: 22px;">
          <strong>INCOMING DEPOSIT ALERT</strong>
        </h1>
      
            </td>
          </tr>
        </tbody>
      </table>
      
        <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
        </div>
      </div>
      <!--[if (mso)|(IE)]></td><![endif]-->
            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-image: url('https://cdn.templates.unlayer.com/assets/1635864800330-tbg.jpg');background-repeat: no-repeat;background-position: center top;background-color: transparent;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-image: url('https://cdn.templates.unlayer.com/assets/1635864800330-tbg.jpg');background-repeat: no-repeat;background-position: center top;background-color: #ffffff;"><![endif]-->
            
      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
        <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
        <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
        
      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px 40px;font-family:arial,helvetica,sans-serif;" align="left">
              
        <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 140%;"><strong><span style="font-size: 16px; line-height: 22.4px; font-family: Raleway, sans-serif;">Dear ${username},</span></strong></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 40px 18px;font-family:arial,helvetica,sans-serif;" align="left">
              
        <div style="line-height: 160%; text-align: left; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;">You have successfully received a sum of ${amount} ${currency} from ${address} address.</span></p>
      <p style="font-size: 14px; line-height: 160%;"> </p>
      <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;"> Feel free to login to your app to confirm this and trade more.</span></p>
      <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;">Thank you for choosing us</span></p>
      <p style="font-size: 14px; line-height: 160%;"> </p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      
      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 50px 40px;font-family:arial,helvetica,sans-serif;" align="left">
              
        <div style="line-height: 120%; text-align: left; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 120%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 19.2px;">Best Regards,</span></p>
      <p style="font-size: 14px; line-height: 120%;"> </p>
      <p style="font-size: 14px; line-height: 120%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 19.2px;">Jupit Team</span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      
        <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
        </div>
      </div>
      <!--[if (mso)|(IE)]></td><![endif]-->
            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #2d4ac0;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #2d4ac0;"><![endif]-->
            
      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
        <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
        <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
        
      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:arial,helvetica,sans-serif;" align="left">
              
      <div align="center">
        <div style="display: table; max-width:43px;">
        <!--[if (mso)|(IE)]><table width="43" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:43px;"><tr><![endif]-->
        
          
          <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
          <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="width: 32px !important;height: 32px !important;display: inline-block;border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
            <tbody><tr style="vertical-align: top"><td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
              <a href="https://instagram.com/jupit" title="Instagram" target="_blank">
                <img src="https://cdn.tools.unlayer.com/social/icons/circle-white/instagram.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
              </a>
            </td></tr>
          </tbody></table>
          <!--[if (mso)|(IE)]></td><![endif]-->
          
          
          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
        </div>
      </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      
        <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
        </div>
      </div>
      <!--[if (mso)|(IE)]></td><![endif]-->
            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #2d4ac0;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #2d4ac0;"><![endif]-->
            
      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
        <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
        <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
        
      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:20px 40px;font-family:arial,helvetica,sans-serif;" align="left">
              
        <div style="color: #ffffff; line-height: 160%; text-align: center; word-wrap: break-word;">
          <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;">©️ Jupit</span></p>
        </div>
      
            </td>
          </tr>
        </tbody>
      </table>
      
        <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
        </div>
      </div>
      <!--[if (mso)|(IE)]></td><![endif]-->
            <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
          </div>
        </div>
      </div>
      
      
      
      <div class="u-row-container" style="padding: 0px;background-color: transparent">
        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
          <div style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
            
      <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
      <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
        <div style="height: 100%;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
        <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;"><!--<![endif]-->
        
      <table style="font-family:arial,helvetica,sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
        <tbody>
          <tr>
            <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:arial,helvetica,sans-serif;" align="left">
              
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding-right: 0px;padding-left: 0px;" align="center">
            
            <img align="center" border="0" src="https://cdn.templates.unlayer.com/assets/1635865576753-ws2.png" alt="Shadow" title="Shadow" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 600px;" width="600"/>
            
          </td>
        </tr>
      </table>
      
            </td>
          </tr>
        </tbody>
      </table>
      
        <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
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
      
      </html>`

      let subject = 'Incoming Deposit Alert'
      let sendVerificationEmail = await zeptomailSend(data,email,subject)

      if(sendVerificationEmail[0]){

        //res.send({"message":"Check Mail for Account Verification Link","callback":"info","status":true})

      }
      else{
        console.log(sendVerificationEmail)
        //res.send({"message":"An Error Occurred..pls try again"})
      }

     
}

async function zeptomailSend(emailData,senderaddress,subject){
    
    const url = "api.zeptomail.com/";
    const token = "Zoho-enczapikey wSsVR60n+xTxDv8rnz2qI+85n1sBBAj0FRh731Sp6Hb+Gv3Bocc/lE2cAAClHfEYQGFpFjYSpLkhyk9UhGBbjNh7nFoJDyiF9mqRe1U4J3x17qnvhDzKXWlckxOKJIgPxgtrmmRlFsok+g==";
    
    let client = new SendMailClient({url, token});
    
   let result = client.sendMail({
        "bounce_address": "bounce_record@bounce.jupitapp.co",
        "from": 
        {
            "address": "noreply@jupitapp.co",
            "name": "Jupit"
        },
        "to": 
        [
            {
            "email_address": 
                {
                    "address": senderaddress,
                    
                }
            }
        ],
        "subject": subject,
        "htmlbody": emailData,
    }).then((resp) => {
        return [true,"sent",resp];
    })
    .catch((error) => {
        return [false ,error];
    });

    return result;
}


async function FailedUpdateEmail(addr,txid,subject,amount,currency){
    const mailData = {
        from: 'hello@jupitapp.co',  // sender address
        to: 'support@jupitapp.co',   // list of receivers
        subject: `${subject}>>>>>>${amount}>>>>${currency}`,
        html: `
                <div style="width:100%;height:100vh;background-color:#f5f5f5; display:flex;justify-content:center;align-item:center">
                    <div style="width:100%; height:70%;background-color:#fff;border-bottom-left-radius:15px;border-bottom-right-radius:15px;">
                        <hr style="width:100%;height:5px;background-color:#1c1c93"/>
                        <div style="width:100%;text-align:center">
                                <img src="https://jupit-asset.s3.us-east-2.amazonaws.com/manual/logo.png" />
                        </div>   
                        <div style="width:100%;text-align:center;margin-top:20px">
                            <h2 style="font-family:candara">Failed Trasaction Impact on ${addr} </h2>
                        <div>   
                        <div style="width:100%;padding-left:20px;text-align:center;padding-top:10px">
                            <hr style="background-color:#f5f5f5;width:95%"/>
                        <div>
                            <div style="width:100%; text-align:center">

                                <p style="font-family:candara;padding:10px;font-size:16px">Dear Team lead,</p>
                                <p style="font-family:candara;font-weight:bold;margin-top:5px;font-size:16px">Kindly Login to your dashboard to reprocess the above wallet address as the balance update on premise failed.</p>
                                <p style="font-family:candara;font-weight:bold;margin-top:5px;font-size:16px">Please Note, the transaction was successfully processed on the blockchain and the fund has been received into our Mass Collection Wallet.</p>
                                <p style="font-family:candara;font-weight:bold;margin-top:5px;font-size:16px;color:#ff0000">Kindly Treat as Urgent!.</p>
                                
                            </div>
                            <div style="width:100%; text-align:center">
                            <p style="font-family:candara;padding:5px"></p>
                            <p style="font-family:candara;padding:5px;color:#1c1c93;font-weight:bold">https:://www.jupit.app</p>
                            </div>
                        </div>
                        </div>

                        <div>
                        <p style="color:#dedede">If you have any questions, please contact support@jupit.app</p>
                        </div>
                    </div>
        
                </div>
            `
      };

    transporter.sendMail(mailData, function (err, info) {
        if(err){
           
            // res.send()
            console.log({"message":"An Error Occurred","callback":err})
        }
        
        else{                                   
           // res.send({"message":"Kindly Check Mail for Account Verification Link","callback":info,"status":true})
            
        }
          
     });
}

Router.get('/test/deposit',async (req,res)=>{
    // await withdrawal.create({
    //     username:"Geoffrey",
    //     userid:"6388b64884f97d934901bac6",
    //     amount:"100",
    //     account_number:"1001744275",
    //     account_name:"TEMILOLUWA ODEWUMI",
    //     bank_code:"030",
    //     email:"eliteappfitness@gmail.com",
    //     type:'Withdrawal',
    //     currency_worth:"200"
    // })

    await wallet_transactions.create({
        type:'Withdrawal',
        serial:"9996832596",
        order_id:"9996832596",
        email:"olami20223@gmail.com",
        currency:'Naira',
        amount:"36600",
        from_address:"9996832596",
        fees:"0",
        to_address:"3116800784",
        status:'Transaction Completed' 
})




await fiatledger.create({
    userid:"6396de2c40c06c21c154f87e",
    email:"olami20223@gmail.com",
    amount:"36600",
    transaction_fee:"100",
    type:"Credit",
    diff_type:'transaction-fee',
    status:'Transaction Completed'
})
    res.send('Success')
        
})


async function updateDepositStatus(body,status){
    let newAmount=0;
    let orderid="";
    let email = ""
    let converter;
    if(body.currency === "BTC"){
        
        newAmount = parseFloat(body.amount * 0.00000001).toFixed(8);
      
        await Usermodel.findOne({'btc_wallet.0.address': body.to_address},(err,docs)=>{
            if(err){
                    orderid="0000";
                    email = "";
            }
            else if(docs){
                
                orderid = docs._id
                email = docs.email;
            }
            else{
               
                orderid="0000";
                email = "";
            }
        }).clone().catch(function(err){ return [err,false]});
    }
    else if(body.currency === "TRX-USDT-TRC20"){
        newAmount = parseFloat(body.amount * 0.000001).toFixed(6);
        await Usermodel.findOne({'usdt_wallet.0.address': body.to_address},(err,docs)=>{
            if(err){
                    orderid="0000";
                    email = "";
            }
            else if(docs){
                orderid = docs._id
                email = docs.email;
            }
            else{
                orderid="0000";
                email=""
            }
        }).clone().catch(function(err){ return [err,false]});
    }

 
    let rateInNaira=0;
    let newCurrency="";
    let marketPrice = 0;
    
    rate.findOne({initialization:'JupitRateBard'},(err,mydocs)=>{
        if(err){
            console.log('rateinnairaError',err)
            rateInNaira=0
        }
        else if(mydocs){
        //    console.log('rate',mydocs);
        //    console.log('bodyCurrency',body.currency)
            if(body.currency == "BTC"){
                rateInNaira = mydocs.btc[0].buy
                converter = parseFloat(body.amount * 0.00000001).toFixed(8);
                
            }
            else if(body.currency == "TRX-USDT-TRC20"){
                
                rateInNaira = mydocs.usdt[1].buy;
                newAmount = parseFloat(body.amount * 0.000001).toFixed(6);
            }
        }
    })
   
    let getcurrentmarketrate = await crypomarketprice();
    console.log('currentMarket',getcurrentmarketrate)
    if(getcurrentmarketrate[0]){
        
        if(body.currency == "BTC"){
           marketPrice = getcurrentmarketrate[1];
          
        }
        else if(body.currency == "TRX-USDT-TRC20"){
            marketPrice = getcurrentmarketrate[2];
            
        }
    }
    else{
        marketPrice = 0;
        
    }
    let usdValue = parseFloat(body.amount * 0.000001).toFixed(6) * parseFloat(marketPrice);
    let nairaValue = usdValue * rateInNaira;
    console.log('Sus',rateInNaira)
    console.log('usdValue',usdValue)
    console.log('marketPrice',marketPrice)
   console.log('nairaValue',nairaValue)

    if(body.currency == "TRX-USDT-TRC20"){
        newCurrency = "USDT"
    }
    else{
        newCurrency = body.currency;
    }

   

    let saveStatus = await Walletmodel.create({
        type:"Receive",
        serial:body.serial,
        order_id:orderid,
        email:email,
        currency:newCurrency,
        txtid:body.txid,
        rateInnaira:rateInNaira,
        usdvalue:usdValue,
        nairavalue:nairaValue,
        marketprice:marketPrice,
        block_height:body.block_height,
        tindex:body.tindex,
        vout_index:body.vout_index,
        amount:newAmount,
        fees:body.fees,
        memo:body.memo,
        broadcast_at:body.broadcast_at,
        chain_at:body.chain_at,
        from_address:body.from_address,
        to_address:body.to_address,
        wallet_id:body.wallet_id,
        state:body.state,
        confirm_blocks:body.confirm_blocks,
        processing_state:body.processing_state,
        decimal:body.decimal,
        currency_bip44:body.currency_bip44,
        token_address:body.token_address,
        status:status
    });

    if(saveStatus){
        return [true,'Wallet Status Saved'];
    }
    else{
        return [false, 'Wallet Status Failed'];
    }

}

async function saveNotificationCallBack(body,status){
    console.log('I got here')
    let newAmount =0,
    newCurrency=""
    if(body.currency === "BTC"){
        newAmount = parseFloat(body.amount * 0.00000001).toFixed(8);
        newCurrency = body.currency
    }
    else if(body.currency === "TRX-USDT-TRC20"){
        newAmount = parseFloat(body.amount * 0.000001).toFixed(6);
        newCurrency = "USDT"
    }
    let saveStatus =  await Notification.create({
        type:4,
        orderid:body.order_id,
        transfertype:newCurrency,
        asset:'Incoming Deposit Update',
        from_address:body.from_address,
        to_address:body.to_address,
        status:status,
        read:'unread',
        date_created:new Date(),
        initiator:newAmount,

    })
    
    
    if(saveStatus){
        return [true,'Notification Incoming Deposit Successful'];
    }
    else{
        return [false,'Notification Incoming Deposit Failed']
    }



}

async function saveNotification(body,status){
    let newAmount,newCurrency
    if(body.currency === "BTC"){
        newAmount = parseFloat(body.amount * 0.00000001).toFixed(8);
        newCurrency = body.currency
    }
    else if(body.currency === "TRX-USDT-TRC20"){
        newAmount = parseFloat(body.amount * 0.000001).toFixed(6);
        newCurrency = "USDT"
    }
    let saveStatus =  await Notification.create({
        type:4,
        orderid:body.order_id,
        transfertype:newCurrency,
        asset:'Incoming Deposit',
        from_address:body.from_address,
        to_address:body.to_address,
        status:status,
        read:'unread',
        date_created:new Date(),
        initiator:newAmount,

    })
    
    if(saveStatus){
        return [true,'Notification Incoming Deposit Failed'];
    }
    else{
        return [false,'Notification Incoming Deposit Failed']
    }



}

export default Router;