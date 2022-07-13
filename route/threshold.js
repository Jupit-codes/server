import express from 'express';
import axios from "axios";
import crypto from 'crypto';
import querystring from 'querystring';
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



const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
       auth: {
            user: 'hello@jupitapp.co',
            pass: 'w6vBmv6624eW'
         },
    secure: true,
    });

const Router  = express.Router();

Router.post('/getautofee',async (req,res)=>{

    let Api ="";
    let wallet_id = "";
    let secret = "";

    if(req.body.walletType === "BTC"){
            secret="2awjZJeeVhtG23tepAzv5tcMYYN";
            Api="55JbxSP6xosFTkFvg"
            wallet_id="194071"
    }
    else if(req.body.walletType === "USDT"){
        wallet_id="488433"
        secret="3EXdWbtVAiMb5BGVF7utbXnCDGb2"
        Api="WtjgBd7JbpeBTHCF"
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

   
    var time = Math.floor(new Date().getTime() / 1000)
    // var postData = [{ "block_num": [1] }]
    const params = ['{"block_nums":[1,50,100]}'];

    var CHECKSUM = build(params,secret,time,rand);


    const parameters = {
        t:time,
        r:rand,
    }
    
    const get_request_args = querystring.stringify(parameters);
   
    const url = `https://demo.thresh0ld.com/v1/sofa/wallets/${wallet_id}/autofees?`+ get_request_args
    
    const new_params = {
        "block_nums": [1,50,100]
    }
   axios.post(url,new_params,{
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':Api,
            'X-CHECKSUM':CHECKSUM,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
   })
   .then((result)=>{
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
    //    console.log(err)
    //    res.send({
    //        "message":err,
    //        "status":false
    //    })
       res.status(403).send(err);
   })
})


Router.get('/activateusdtToken',async(req,res)=>{
    let result = await activate_token();
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

async function crypomarketprice(){
    let x = await axios.get('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,USDT&tsyms=USD',{
        headers:{
            'Content-Type':'application/json',
            'Authorization':'Apikey 475906935b55657e131801270facf7cd73a797ee9cff36bbb24185f751c18d63'
        }
    })
    .then(result=>{
       
        let BTCprice = parseFloat(result.data.RAW.BTC.USD.PRICE) - 150;
        let USDTprice = result.data.RAW.USDT.USD.PRICE
        return [true,BTCprice,USDTprice]
        
    })
    .catch(err=>{
        console.log(err)
        return [false]
    })

    return x;
}



Router.post('/incoming/depositcallback',(req,res)=>{
    
    if(req.headers['x-checksum'] !== "undefined" || req.headers['x-checksum'] !== "" ){
        console.log(req.body)
        if(req.body.processing_state === 1){
            Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                if(err){
                    res.json({
                        'message':'An Error'+err,
                        'status':false
                    })
                }
                if(docs){

                }
                else{
                    
                    let status = 'Processing';
                    let insert = await updateDepositStatus(req.body,status);
                    // console.log('Deposit-Processing')
                    if(insert[0]){
                        let saveNotificationx = await saveNotification(req.body,status)
                    }

                    
                    
                }
            })
        }

            
        if(req.body.processing_state === 2){

            Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                if(err){
                    res.json({
                        'message':err,
                        'status':false
                    })
                }
                if(docs){
                    if(docs.processing_state !== 2){
                        let status = 'Transaction Completed';
                        await wallet_transactions.findOneAndUpdate({txtid:req.body.txid},{status:status,processing_state:req.body.processing_state,state:req.body.state,confirm_blocks:req.body.confirm_blocks}).exec();
                        let newAmount;
                        let UpdateDepositAccount;
                        if(req.body.currency === "BTC"){
                            newAmount = parseFloat(req.body.amount * 0.00000001).toFixed(8);
                        }
                        else if(req.body.currency === "USDT"){
                            newAmount = parseFloat(req.body.amount * 0.000001).toFixed(6);
                        }
                        
                        if(req.body.currency === "BTC"){
                            UpdateDepositAccount  = await Usermodel.findOneAndUpdate({'btc_wallet.address':req.body.to_address},{$inc:{'btc_wallet.$.balance':parseFloat(req.body.amount).toFixed(8)}}).exec();
                        }
                        else if(req.body.currency === "USDT"){
                            UpdateDepositAccount  = await Usermodel.findOneAndUpdate({'usdt_wallet.address':req.body.to_address},{$inc:{'usdt_wallet.$.balance':parseFloat(req.body.amount).toFixed(8)}}).exec();
                        }
                       
                        if(UpdateDepositAccount){

                             res.sendStatus(200);
                        }
                        else{
                            let subject = "Failed Deposit Update onPremises"
                            await FailedUpdateEmail(req.body.to_address,req.body.txtid,subject,req.body.amount);
                            res.sendStatus(200);
                        }
                        // console.log('Deposit-Completed2')
                      
                        
                        
                    }
                    
                }
                else{
                   
                    let status = 'Transaction Completed';
                    let insert = await updateDepositStatus(req.body,status);
                   
                    if(insert[0]){
                        //NOtification
                        let saveNotificationx = await saveNotification(req.body,status)
                    }


                    let UpdateDepositAccount  = await Usermodel.findOneAndUpdate({'btc_wallet.address':req.body.to_address},{$inc:{'btc_wallet.$.balance':parseFloat(req.body.amount).toFixed(8)}}).exec();
                    if(UpdateDepositAccount){

                        res.sendStatus(200);
                   }
                   else{
                       let subject = "Failed Deposit Update onPremises"
                       await FailedUpdateEmail(req.body.to_address,req.body.txtid,subject,req.body.amount);
                       res.sendStatus(200);
                   }
                    
                }
            })
            
           
            
        }
        if(req.body.processing_state === -1){
            
            // res.sendStatus(200)
            if(req.body.state === 5){
                Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    if(docs){
                        if(docs.processing_state !== -1){
                            let status = 'Transaction Failed';
                            let insert = await updateDepositStatus(req.body,status);

                            if(insert[0]){
                                //notification
                                let saveNotificationx = await saveNotification(req.body,status)
                            }
     
                        }
                        
                        res.sendStatus(200);
                    }
                    else{
                        // console.log('Transaction Failed',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })
               
            }
            else if(req.body.state === 8 ){

                Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    if(docs){
                        if(docs.processing_state !== -1){
                           
                            let status = 'Transaction Cancelled';
                            let insert = await updateDepositStatus(req.body,status);

                            if(insert[0]){
                                //notification
                                let saveNotificationx = await saveNotification(req.body,status)
                            }
                            
                            
                        }
                       
                        res.sendStatus(200);
                    }
                    else{
                        // console.log('Transaction Cancelled',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })
                
            }
            else if(req.body.state ===  10){

                Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    if(docs){
                        if(docs.processing_state !== -1){
                            

                            let status = 'Transaction Dropped';
                            let insert = await updateDepositStatus(req.body,status);

                            if(insert[0]){
                                //notification
                                let saveNotificationx = await saveNotification(req.body,status)
                            }

                           
                            
                            
                        }
                        
                        res.sendStatus(200);
                    }
                    else{
                        
                        res.sendStatus(200);
                        
                       
                    }
                })      
            }
            else{
                Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    if(docs){
                        if(docs.processing_state !== -1){
                           

                            let status = 'Transaction Unsuccessful';
                            let insert = await updateDepositStatus(req.body,status);

                            if(insert[0]){
                                let saveNotificationx = await saveNotification(req.body)
                            }
                            
                            
                        }
                        
                        res.sendStatus(200);
                    }
                    else{
                        // console.log('Transaction Unsuccessful',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })
                


                res.json({
                    'message':'Transaction Unsuccessful',
                    'status':false,
                    'completed':false
                }) 
            }
            
            
        }
    }
    else{
        res.json({
            'message':'Forbidden',
            'status':false,
            'completed':false
        }) 
    }
   
})


Router.post('/incoming/withdrawalcallback',(req,res)=>{
    res.sendStatus(200);
    
    if(req.headers['x-checksum'] !== "undefined" || req.headers['x-checksum'] !== "" ){
        console.log(req.body)
        let newAmount;
        if(req.body.processing_state === 1){
            Walletmodel.findOne({txtid:req.body.txid}, async function(err,docs){
                if(err){
                    res.json({
                        'message':'An Error'+err,
                        'status':false
                    })
                }
                if(docs){

                }
                else{
                   
                    let status = "Processing"
                    let insert = await updateDepositStatus(req.body,status);

                    if(insert[0]){
                        let saveNotificationx = saveNotification(req.body,status)
                    }

                   
                    
                }
            })

            
            
        }
        if(req.body.processing_state === 2){

            Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                if(err){
                    res.json({
                        'message':err,
                        'status':false
                    })
                }
                if(docs){
                    if(docs.processing_state !== 2){

                    
                        if(req.body.currency === "BTC"){
                            newAmount = parseFloat(req.body.amount * 0.00000001).toFixed(8);
                        }
                        else if(req.body.currency === "USDT"){
                            newAmount = parseFloat(req.body.amount * 0.000001).toFixed(6);
                        }

                        Walletmodel.create({
                            type:"Send",
                            serial:req.body.serial,
                            order_id:req.body.order_id,
                            currency:req.body.currency,
                            txtid:req.body.txid,
                            block_height:req.body.block_height,
                            tindex:req.body.tindex,
                            vout_index:req.body.vout_index,
                            amount:newAmount,
                            fees:req.body.fees,
                            memo:req.body.memo,
                            broadcast_at:req.body.broadcast_at,
                            chain_at:req.body.chain_at,
                            from_address:req.body.from_address,
                            to_address:req.body.to_address,
                            wallet_id:req.body.wallet_id,
                            state:req.body.state,
                            confirm_blocks:req.body.confirm_blocks,
                            processing_state:req.body.processing_state,
                            decimal:req.body.decimal,
                            currency_bip44:req.body.currency_bip44,
                            token_address:req.body.token_address,
                            status:'Transaction Completed'
                        });

                        Notification.create({
                            type:req.body.type,
                            orderid:req.body.orderid,
                            transfertype:'BlockChain Transfer',
                            asset:req.body.currency,
                            from_address:req.body.from_address,
                            to_address:req.body.to_address,
                            amount:req.body.amount,
                            status:'Transaction Completed',
                            read:'unread',
                            initiator:'sender',
                            date_created:new Date(),
                            senderaddress:req.body.orderid,
                            // senderaddress:req.body.from_address,
                        })
   
                    }
                    // console.log('Transaction Completed',req.body)
                    res.sendStatus(200); 
                }
                else{
                    // console.log('Transaction Completed Already',req.body)
                    res.sendStatus(200);
                    
                   
                }
            })
            
            // res.sendStatus(200);
            // res.json({
            //     'message':'Transaction Completed',
            //     'status':true,
            //     'completed':true
            // })
            
        }
        if(req.body.processing_state === -1){
            
            // res.sendStatus(200)
            if(req.body.state === 5){
                Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    if(docs){
                        if(docs.processing_state !== -1){
                            Walletmodel.create({
                                type:"Send",
                                serial:req.body.serial,
                                order_id:req.body.order_id,
                                currency:req.body.currency,
                                txtid:req.body.txid,
                                block_height:req.body.block_height,
                                tindex:req.body.tindex,
                                vout_index:req.body.vout_index,
                                amount:req.body.amount,
                                fees:req.body.fees,
                                memo:req.body.memo,
                                broadcast_at:req.body.broadcast_at,
                                chain_at:req.body.chain_at,
                                from_address:req.body.from_address,
                                to_address:req.body.to_address,
                                wallet_id:req.body.wallet_id,
                                state:req.body.state,
                                confirm_blocks:req.body.confirm_blocks,
                                processing_state:req.body.processing_state,
                                decimal:req.body.decimal,
                                currency_bip44:req.body.currency_bip44,
                                token_address:req.body.token_address,
                                status:'Transaction Failed'
                            });
                            
                            
                        }
                        
                        let total = parseFloat(req.body.amount * 0.00000001).toFixed(8) + parseFloat(req.body.fees * 0.00000001).toFixed(8);
                        let Reversal  = await Usermodel.findOneAndUpdate({'btc_wallet.address':req.body.to_address},{$inc:{'btc_wallet.$.balance':parseFloat(total).toFixed(8)}}).exec();
                        // console.log('Transaction Failed',req.body)
                        if(Reversal){
                            res.sendStatus(200);
                        }
                        else{
                            let subject = "Failed Reversal Update On Premises"
                            await FailedUpdateEmail(req.body.to_address,req.body.txtid,subject,req.body.amount);
                            res.sendStatus(200);
                        }
                        
                    }
                    else{
                        // console.log('Transaction Failed',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })
               
            }
            else if(req.body.state === 8 ){

                Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    if(docs){
                        if(docs.processing_state !== -1){
                            Walletmodel.create({
                                type:"Send",
                                serial:req.body.serial,
                                order_id:req.body.order_id,
                                currency:req.body.currency,
                                txtid:req.body.txid,
                                block_height:req.body.block_height,
                                tindex:req.body.tindex,
                                vout_index:req.body.vout_index,
                                amount:req.body.amount,
                                fees:req.body.fees,
                                memo:req.body.memo,
                                broadcast_at:req.body.broadcast_at,
                                chain_at:req.body.chain_at,
                                from_address:req.body.from_address,
                                to_address:req.body.to_address,
                                wallet_id:req.body.wallet_id,
                                state:req.body.state,
                                confirm_blocks:req.body.confirm_blocks,
                                processing_state:req.body.processing_state,
                                decimal:req.body.decimal,
                                currency_bip44:req.body.currency_bip44,
                                token_address:req.body.token_address,
                                status:'Transaction Cancelled'
                            });
                            
                            
                        }
                        let total = parseFloat(req.body.amount * 0.00000001).toFixed(8) + parseFloat(req.body.fees * 0.00000001).toFixed(8);
                        let Reversal  = await Usermodel.findOneAndUpdate({'btc_wallet.address':req.body.to_address},{$inc:{'btc_wallet.$.balance':parseFloat(total).toFixed(8)}}).exec();
                        // console.log('Transaction Failed',req.body)
                        if(Reversal){
                            res.sendStatus(200);
                        }
                        else{
                            let subject = "Failed Reversal Update On Premises"
                            await FailedUpdateEmail(req.body.to_address,req.body.txtid,subject,req.body.amount);
                            res.sendStatus(200);
                        }
                        
                    }
                    else{
                        // console.log('Transaction Cancelled',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })
                
            }
            else if(req.body.state ===  10){

                Walletmodel.findOne({txtid:req.body.txid},async function(err,docs){
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    if(docs){
                        if(docs.processing_state !== -1){
                            Walletmodel.create({
                                type:"Send",
                                serial:req.body.serial,
                                order_id:req.body.order_id,
                                currency:req.body.currency,
                                txtid:req.body.txid,
                                block_height:req.body.block_height,
                                tindex:req.body.tindex,
                                vout_index:req.body.vout_index,
                                amount:req.body.amount,
                                fees:req.body.fees,
                                memo:req.body.memo,
                                broadcast_at:req.body.broadcast_at,
                                chain_at:req.body.chain_at,
                                from_address:req.body.from_address,
                                to_address:req.body.to_address,
                                wallet_id:req.body.wallet_id,
                                state:req.body.state,
                                confirm_blocks:req.body.confirm_blocks,
                                processing_state:req.body.processing_state,
                                decimal:req.body.decimal,
                                currency_bip44:req.body.currency_bip44,
                                token_address:req.body.token_address,
                                status:'Transaction Dropped'
                            });
                            
                            
                        }
                        let total = parseFloat(req.body.amount * 0.00000001).toFixed(8) + parseFloat(req.body.fees * 0.00000001).toFixed(8);
                        let Reversal  = await Usermodel.findOneAndUpdate({'btc_wallet.address':req.body.to_address},{$inc:{'btc_wallet.$.balance':parseFloat(total).toFixed(8)}}).exec();
                        // console.log('Transaction Failed',req.body)
                        if(Reversal){
                            res.sendStatus(200);
                        }
                        else{
                            let subject = "Failed Reversal Update On Premises"
                            await FailedUpdateEmail(req.body.to_address,req.body.txtid,subject);
                            res.sendStatus(200);
                        }
                        
                    }
                    else{
                        // console.log('Transaction Dropped',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })      
            }
            else{
                Walletmodel.findOne({txtid:req.body.txid},function(err,docs){
                    if(err){
                        res.json({
                            'message':err,
                            'status':false
                        })
                    }
                    if(docs){
                        if(docs.processing_state !== -1){
                            Walletmodel.create({
                                type:"Send",
                                serial:req.body.serial,
                                order_id:req.body.order_id,
                                currency:req.body.currency,
                                txtid:req.body.txtid,
                                block_height:req.body.block_height,
                                tindex:req.body.tindex,
                                vout_index:req.body.vout_index,
                                amount:req.body.amount,
                                fees:req.body.fees,
                                memo:req.body.memo,
                                broadcast_at:req.body.broadcast_at,
                                chain_at:req.body.chain_at,
                                from_address:req.body.from_address,
                                to_address:req.body.to_address,
                                wallet_id:req.body.wallet_id,
                                state:req.body.state,
                                confirm_blocks:req.body.confirm_blocks,
                                processing_state:req.body.processing_state,
                                decimal:req.body.decimal,
                                currency_bip44:req.body.currency_bip44,
                                token_address:req.body.token_address,
                                status:'Transaction Unsuccessful'
                            });
                            
                            
                        }
                        // console.log('Transaction Unsuccessful',req.body)
                        res.sendStatus(200);
                    }
                    else{
                        // console.log('Transaction Unsuccessful',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })
                


                res.json({
                    'message':'Transaction Unsuccessful',
                    'status':false,
                    'completed':false
                }) 
            }
            
            
        }
    }
    else{
        res.json({
            'message':'Forbidden',
            'status':false,
            'completed':false
        }) 
    }
})

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
                let fee = parseFloat(block_average_fee * 226 * 0.00000001 ).toFixed(8);
                let totalAmount  = parseFloat(networkFee) + parseFloat(amount)
                
                
        let UpdateWalletBalances = await updateWalletBalance(user_id,parseFloat(totalAmount).toFixed(8),wallet_type,fee,sender,recipentaddress);
        if(UpdateWalletBalances){
            if(wallet_type === "BTC"){
                
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
                        usdvalue: req.body.usdequivalent,
                        marketprice: req.body.current_usd_rate,
                        nairaRate:'580',
                        txtid:req.body.txid,
                        currency:req.body.currency,
                        type:req.body.type,
                        serial:req.body.serial,
                        order_id:WalletCallback[2],
                        to_address:req.body.to_address,
                        amount:amount,
                        
                        // block_height:req.body.block_height,
                        // tindex:req.body.tindex,
                        // vout_index:req.body.vout_index,
                        
                        // fees:req.body.fees,
                        // memo:req.body.memo,
                        // broadcast_at:req.body.broadcast_at,
                        // chain_at:req.body.chain_at,
                        // from_address:req.body.from_address,
                        // to_address:req.body.to_address,
                        // wallet_id:req.body.wallet_id,
                        // state:req.body.state,
                        // confirm_blocks:req.body.confirm_blocks,
                        // processing_state:req.body.processing_state,
                        // decimal:req.body.decimal,
                        // currency_bip44:req.body.currency_bip44,
                        // token_address:req.body.token_address,
                        
                    })
                    
                    res.send({
                        "Message":"Transaction Initiated",
                        "Status":true
                    })
                }
                else{
                    // console.log(WalletCallback[0]);
                    res.status(403).send("Internal Server Error..")
                    // res.json({
                    //     "Message":"Internal Server Error..",
                    //     "Status":false
                    // })
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
                    
                    res.send({
                        "Message":"Transaction Initiated",
                        "Status":true
                    })
                }
                else{
                    // console.log(WalletCallback[0]);
                    res.status(403).send("Internal Server Error..")
                    // res.json({
                    //     "Message":"Internal Server Error..",
                    //     "Status":false
                    // })
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
    }).sort({updated:-1})

})


Router.post('/notification/fetch',middlewareVerify,(req,res)=>{
    const addressBTC = req.body.addressBTC;
    const addressUSDT = req.body.addressUSDT;
    const userid = req.body.userid;
    const email= req.body.email;
    //{$and:[{read:'unread'}]}
    Notification.find({ 
        $and:[
            {

                $or: [
                    { from_address: addressBTC }, 
                    { to_address: addressBTC },
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
    }).limit(10).sort({date_created: -1})

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

    let userid = "62509e4a135feac8ad2be9c9";

    let update = await Usermodel.updateMany({_id:userid},{ $set: { Pin_Created: false,email_verification:true } });
    
    if(update){
        res.send({
            'message':'Save'
        })
    }
    else{
        console.log('err')
    }
    
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

async function creditWalletAddress(userid,address,recipentAddress,wallet_type,auto_fee,amount,block_average_fee){
    
    let isTrue ;
    let secret="3QdPXcmt7RYeMKBQy9eM281N7gMD";
    let apikey = "N5zrXLSLpfbxC3BX";
    let wallet_id="678693"
   
    

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
            "order_id": "187795_"+generate_order_id,
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

      
    const parameters = {
        t:time,
        r:rand,
    }
 
    const get_request_args = querystring.stringify(parameters);
   
    const url = `https://demo.thresh0ld.com/v1/sofa/wallets/${wallet_id}/sender/transactions?`+ get_request_args
    
   
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
    
        return([result.data,true,generate_order_id])
        // let jupitPromise = new Promise(function(resolve,reject){
        //     isTrue = true;
        //     if(isTrue){
        //         resolve()
        //     }
            
        // })
        // jupitPromise.then(()=>{
        //     return 'Completed';
        // }).catch((err)=>{
        //     return 'Uncompleted'
        // })
        
        
   })
   .catch((err)=>{
    // console.log(err)
    // return new Promise(function(resolve,reject){
    //     resolve(err.response.data);
    // })
    //    console.log('err',err.response.data)
    console.log(err.response.data)
    return [err.response.data,false]
    

    // let jupitPromise = new Promise(function(resolve,reject){
    //     isTrue = false;
    //     if(isTrue){
    //         resolve()
    //     }
    //     else{
    //         reject();
    //     }
        
    // })
    // jupitPromise.then(()=>{
    //     return 'Completed';
    // }).catch((err)=>{
    //     return 'Uncompleted'
    // })

    
    
   });
//    console.log('myAxios',myAxios);
   return myAxios;
   
   
   
}


async function creditWalletAddressUSDT(userid,address,recipentAddress,wallet_type,auto_fee,amount,networkFee){
    
    let isTrue ;
   
    let secret="3EXdWbtVAiMb5BGVF7utbXnCDGb2";
    let  apikey="WtjgBd7JbpeBTHCF"
    let wallet_id="201075"
    


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
            "order_id": "187795_"+userid,
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
   
    const url = `https://demo.thresh0ld.com/v1/sofa/wallets/${wallet_id}/sender/transactions?`+ get_request_args
    
   
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
    
        return([result.data,true,generate_order_id])
        // let jupitPromise = new Promise(function(resolve,reject){
        //     isTrue = true;
        //     if(isTrue){
        //         resolve()
        //     }
            
        // })
        // jupitPromise.then(()=>{
        //     return 'Completed';
        // }).catch((err)=>{
        //     return 'Uncompleted'
        // })
        
        
   })
   .catch((err)=>{
    // console.log(err)
    // return new Promise(function(resolve,reject){
    //     resolve(err.response.data);
    // })
    //    console.log('err',err.response.data)
    // console.log(err.response.data)
    return [err.response.data,false]
    

    // let jupitPromise = new Promise(function(resolve,reject){
    //     isTrue = false;
    //     if(isTrue){
    //         resolve()
    //     }
    //     else{
    //         reject();
    //     }
        
    // })
    // jupitPromise.then(()=>{
    //     return 'Completed';
    // }).catch((err)=>{
    //     return 'Uncompleted'
    // })

    
    
   });
//    console.log('myAxios',myAxios);
   return myAxios;
   
   
   
}



function generateuuID(){
    return randomUUID(); 
}

async function checkJupitAddress(address,wallet_type){
    const addrr = [];
    let secret="";
    let apikey="";
    if(wallet_type === "BTC"){
        secret="3A84eebqYqeU3HaaXMcEAip8zBRS";
        apikey = "4PiVpdbyLJZatLBwR";
    }
    else if(wallet_type === "USDT"){
        secret="3EXdWbtVAiMb5BGVF7utbXnCDGb2";
        apikey = "WtjgBd7JbpeBTHCF";
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
   
    const url = 'https://demo.thresh0ld.com/v1/sofa/wallets/194071/addresses?'+ get_request_args
    
   
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
            secret = "2awjZJeeVhtG23tepAzv5tcMYYN";
            Api="55JbxSP6xosFTkFvg";
            walletId ="194071"
            
        }
        else if(walletType === "USDT"){
            Api="WtjgBd7JbpeBTHCF";
            secret = "3EXdWbtVAiMb5BGVF7utbXnCDGb2";
            walletId="488433"
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
        
        const url = `https://demo.thresh0ld.com/v1/sofa/wallets/${walletId}/addresses/verify?`+get_request_args

        
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
                        let newValue =   oldValue - amount;
                        let updateValue =  await Usermodel.findByIdAndUpdate(user_id,{$set:{'btc_wallet':{'balance':parseFloat(newValue).toFixed(8),'address':fromAddress}}},function(err,docs){
                            if(err){
                                    return [err,false]
                            }
                            else{
                                return ['updated',true]
                            }
                        }).clone().catch(function(err){ return [err,false]});
                    }
                    else if(wallet_type === "USDT"){
                            let oldValue = docs.usdt_wallet[0].balance;
                            let newValue =   oldValue - amount;
                            let updateValue =  await Usermodel.findByIdAndUpdate(user_id,{$set:{'usdt_wallet':{'balance':parseFloat(newValue).toFixed(8),'address':fromAddress}}},function(err,docs){
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


Router.post('/update/phonenumber',middlewareVerify,async(req,res)=>{
let userid = req.body.userid;
let phonenumber = req.body.newphonenumber;

let update = await Usermodel.findOneAndUpdate({_id:userid},{'phonenumber':phonenumber}).exec()

if(update){
    res.send('Phonenumber Successfully Updated');
}
else{
    res.status(400).send('Update Error');
}

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
                        let newValue =   parseFloat(oldValue) - parseFloat(amount);
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
                        let newValue =   parseFloat(oldValue) - parseFloat(amount);
                        
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
var secret="2Tzeo889sniN76LerbwjCSshkSZN";
// var rand = "Ademilola2@";
var time = Math.floor(new Date().getTime() / 1000)
var params="";
var postData=""
const parameters = {
  t:time,
  r:rand
}

var build = buildChecksum(null,secret,time,rand,null);

const get_request_args = querystring.stringify(parameters);

const options = {
  hostname: 'demo.thresh0ld.com',
  path: '/v1/sofa/wallets/194071/apisecret/activate?'+ get_request_args,
  method: 'POST',
  headers: {
        'Content-Type': 'application/json',
        'X-API-CODE':'491Wh19j3Ece4MJRz',
        'X-CHECKSUM':build,
        'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
      }
}

const req = https.request(options, res => {
//   console.log(`statusCode: ${res.statusCode}`)
  

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
    var secret="2Tzeo889sniN76LerbwjCSshkSZN";
    // var rand = "Ademilola2@";
    var time = Math.floor(new Date().getTime() / 1000)
    var params="";
    var postData="";

    var build = buildChecksum(null,secret,time,rand,null);

    const parameters = {
        t:time,
        r:rand,
    }
    const get_request_args = querystring.stringify(parameters);
    
    const url = 'https://demo.thresh0ld.com/v1/sofa/wallets/488433/apisecret/activate?'+get_request_args

    let axiosCallback = await axios.post(url,params,{ 
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':'491Wh19j3Ece4MJRz',
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

async function FailedUpdateEmail(addr,txid,subject,amount){
    const mailData = {
        from: 'hello@jupitapp.co',  // sender address
        to: 'support@jupitapp.co',   // list of receivers
        subject: `${subject}>>>>>>${amount}`,
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
           
            res.send({"message":"An Error Occurred","callback":err})
        }
        
        else{                                   
           // res.send({"message":"Kindly Check Mail for Account Verification Link","callback":info,"status":true})
            
        }
          
     });
}

async function updateDepositStatus(body,status){
    let newAmount;
    let orderid;
    if(body.currency === "BTC"){
        newAmount = parseFloat(body.amount * 0.00000001).toFixed(8);
        await Usermodel.findOne({'btc_wallet[0].address': body.to_address},(err,docs)=>{
            if(err){
                    orderid="0000";
            }
            else if(docs){
                orderid = docs.userid
            }
            else{
                orderid="0000";
            }
        }).clone().catch(function(err){ return [err,false]});
    }
    else if(body.currency === "USDT"){
        newAmount = parseFloat(body.amount * 0.000001).toFixed(6);
        await Usermodel.findOne({'usdt_wallet[0].address': body.to_address},(err,docs)=>{
            if(err){
                    orderid="0000";
            }
            else if(docs){
                orderid = docs.userid
            }
            else{
                orderid="0000";
            }
        }).clone().catch(function(err){ return [err,false]});
    }
    let rateInNaira,marketPrice
    
    rate.find({},(err,docs)=>{
        if(err){
            rateInNaira='error'
        }
        else if(docs){
            // btcbuyrate = docs.btc[1].buy
            // usdtbuyrate = docs.btc[1].buy
            if(body.currency == "BTC"){
                rateInNaira = docs.btc[1].buy
            }
            else if(body.currency == "USDT"){
                usdtbuyrate = docs.usdt[1].buy
            }
        }
    })
    
    let getcurrentmarketrate = await crypomarketprice();
    if(getcurrentmarketrate[0]){
        if(body.currency == "BTC"){
           marketPrice = getcurrentmarketrate[1]
        }
        else if(body.currency == "USDT"){
            marketPrice = getcurrentmarketrate[2]
        }
    }
    else{
        marketPrice = 0;
    }
    let usdValue = newAmount * marketPrice;
    let nairaValue = usdValue * rateInNaira;
    let saveStatus = await Walletmodel.create({
        type:"Receive",
        serial:body.serial,
        order_id:orderid,
        currency:body.currency,
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

async function saveNotification(body,status){
    let newAmount;
    if(body.currency === "BTC"){
        newAmount = parseFloat(body.amount * 0.00000001).toFixed(8);
    }
    else if(body.currency === "USDT"){
        newAmount = parseFloat(body.amount * 0.000001).toFixed(6);
    }
    let saveStatus =  await Notification.create({
        type:4,
        orderid:body.order_id,
        transfertype:body.currency,
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