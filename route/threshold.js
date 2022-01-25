import express from 'express';
import axios from "axios";
import crypto from 'crypto';
import querystring from 'querystring';
import random from 'random-number';
import Usermodel from '../model/users.js';
import Walletmodel from '../model/wallet_transactions.js'
import { randomUUID } from 'crypto'



const Router  = express.Router();

Router.post('/getautofee',(req,res)=>{

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

    var secret="3A84eebqYqeU3HaaXMcEAip8zBRS";
    var time = Math.floor(new Date().getTime() / 1000)
    // var postData = [{ "block_num": [1] }]
    const params = ['{"block_nums":[1,50,100]}'];

    var CHECKSUM = build(params,secret,time,rand);


    const parameters = {
        t:time,
        r:rand,
    }
    
    const get_request_args = querystring.stringify(parameters);
   
    const url = 'https://demo.thresh0ld.com/v1/sofa/wallets/194071/autofees?'+ get_request_args
    
    const new_params = {
        "block_nums": [1,50,100]
    }
   axios.post(url,new_params,{
        headers: {
            'Content-Type': 'application/json',
            'X-API-CODE':'4PiVpdbyLJZatLBwR',
            'X-CHECKSUM':CHECKSUM,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
   })
   .then((result)=>{
       console.log(result.data['auto_fees'][0]['auto_fee'])
        
        res.send({
           "message":result.data,
            "status":true
        })
        
   })
   .catch((err)=>{
       console.log(err)
       res.send({
           "message":err,
           "status":false
       })
   })
})

Router.post('/incoming/depositcallback',(req,res)=>{
    console.log('Welcome Incoming CallBack')
    console.log(req.headers['x-checksum']);
    console.log(req.body);
    if(req.headers['x-checksum'] !== "undefined" || req.headers['x-checksum'] !== "" ){
        if(req.body.processing_state === 1){
            Walletmodel.findOne({txtid:req.body.txid},function(err,docs){
                if(err){
                    res.json({
                        'message':'An Error'+err,
                        'status':false
                    })
                }
                if(docs){

                }
                else{
                    Walletmodel.create({
                        type:req.body.type,
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
                        status:'Processing'
                    });
                    
                    console.log('1st Notification Saved',req.body)
                    // res.sendStatus(200);
                    
                    // res.json({
                    //     'message':'Transaction done (N blocks confirmations reached)',
                    //     'status':true,
                    //     'completed':true
                    // })
                }
            })

            
            
        }
        if(req.body.processing_state === 2){

            Walletmodel.findOne({txtid:req.body.txid},function(err,docs){
                if(err){
                    res.json({
                        'message':err,
                        'status':false
                    })
                }
                if(docs){
                    if(docs.processing_state !== 2){
                        Walletmodel.create({
                            type:req.body.type,
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
                            status:'Transaction done (N blocks confirmations reached)'
                        });
                        
                        
                    }
                    console.log('Transaction done (N blocks confirmations reached)',req.body)
                    res.sendStatus(200);
                }
                else{
                    console.log('Transaction done (N blocks confirmations reached)',req.body)
                    res.sendStatus(200);
                    
                   
                }
            })
            
            // res.sendStatus(200);
            // res.json({
            //     'message':'Transaction done (N blocks confirmations reached)',
            //     'status':true,
            //     'completed':true
            // })
            
        }
        if(req.body.processing_state === -1){
            
            // res.sendStatus(200)
            if(req.body.state === 5){
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
                                type:req.body.type,
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
                        console.log('Transaction Failed',req.body)
                        res.sendStatus(200);
                    }
                    else{
                        console.log('Transaction Failed',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })
               
            }
            else if(req.body.state === 8 ){

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
                                type:req.body.type,
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
                        console.log('Transaction Cancelled',req.body)
                        res.sendStatus(200);
                    }
                    else{
                        console.log('Transaction Cancelled',req.body)
                        res.sendStatus(200);
                        
                       
                    }
                })
                
            }
            else if(req.body.state ===  10){

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
                                type:req.body.type,
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
                        console.log('Transaction Dropped',req.body)
                        res.sendStatus(200);
                    }
                    else{
                        console.log('Transaction Dropped',req.body)
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
                                type:req.body.type,
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
                        console.log('Transaction Unsuccessful',req.body)
                        res.sendStatus(200);
                    }
                    else{
                        console.log('Transaction Unsuccessful',req.body)
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
    console.log('withdrawalcallback','Callback');
    res.send({
        'message':'Withdrawal Callback'
    })
})

Router.post('/transfer/asset',middlewareVerify,(req,res)=>{
    const userid = req.body.userid;
    const wallets_type = req.body.wallet_type;
    const auto_fee = req.body.auto_fee;
    const amount = req.body.amount;
    const recipentAddress = req.body.recipentaddress
    
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
                
                let totalAmount  = parseFloat(auto_fee) + parseFloat(amount);

                if(docs.btc_wallet[0].balance > totalAmount ){
                    
                    let jupitAddress = await checkJupitAddress(recipentAddress,wallets_type);
                    
                    if(jupitAddress[1]){
                        if(jupitAddress[0]=== "JupitCustomer"){
                            let InternalWallet = await InternalWalletTransfer(docs._id,recipentAddress,amount)
                            
                            if(InternalWallet){
                                res.json(InternalWallet);
                            }
                            else{
                                res.json('Error');
                            }
                            

                            // if(InternalWallet[1]){
                                
                            // }
                            // else{
                            //     res.json(InternalWallet)
                            // }
                            
                        
                        }
                        else{
                             let WalletCallback =  await creditWalletAddress(docs._id,docs.btc_wallet[0].address,recipentAddress,wallets_type,auto_fee,amount)
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
                    }
                    
                   
                       
                }
                else{
                    res.json({
                        "message":'Insufficent Balance',
                        "Status":false
                    })
                }
               
                
            }
            if(wallets_type === "USDT"){
                let totalAmount  = parseFloat(auto_fee) + parseFloat(amount);
                if(totalAmount > docs.usdt_wallet[0].balance ){
                    let callback = creditWalletAddress(docs._id,docs.usdt_wallet[0].address,recipentAddress,wallets_type,auto_fee,parseFloat(amount))
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

async function creditWalletAddress(userid,address,recipentAddress,wallet_type,auto_fee,amount){
    let secret="";
    let apikey = "";
    let isTrue ;
   
    if(wallet_type === "BTC"){
        secret="44bJugkgbvhzqaMiQ3inE8Hebeka";
        apikey = "4W1Pg2CeHQMS8hHGr";
    }
    else if(wallet_type === "USDT"){

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

    // var secret="44bJugkgbvhzqaMiQ3inE8Hebeka";
    var time = Math.floor(new Date().getTime() / 1000);
    var generate_order_id = generateuuID();
    console.log('Amount',amount);
    var params = {
        "requests": [
          {
            "order_id": "187795_"+generate_order_id,
            "address": recipentAddress,
            "amount": amount,
            "memo": "memo-"+userid,
            "user_id": userid,
            "message": "message-"+userid,
            "block_average_fee": auto_fee
            
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
   
    const url = 'https://demo.thresh0ld.com/v1/sofa/wallets/678693/sender/transactions?'+ get_request_args
    
   
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
    
        return([result.data,true])
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
        console.log('myaddress',addrr)
        if(addrr.includes(address)){
            console.log(address)
            console.log(addrr.includes(address))
            return (['JupitCustomer',true]);
        }
        else{
            console.log(address)
            console.log(addrr.includes(address))
            return (['Non-JupitCustomer',true]);
        }
        
   })
   .catch((err)=>{
    
    return [err.response.data,false]
    
   });

   return check;
  
}
async function InternalWalletTransfer(user_id,receipentAddress,amount){

//    let getRequest =  await Usermodel.findOne({'btc_wallet[0].address':receipentAddress},(err,docs)=>{
//         if(err){
//            return [err,false]
//         }
//         else if(docs){

//             Usermodel.findByIdAndUpdate(docs._id, { 
//                 $push: { 
//                         btc_wallet: {"balance":500,},
                        
//                     } 
//                 }).exec();
//                 return[docs,true]
//         }
//     }).clone().catch(function(err){ return [err,false]});


        let getRequest = await Usermodel.findOneAndUpdate({'btc_wallet.address':receipentAddress},{$inc:{'btc_wallet.$.balance':amount}},null,(err)=>{
            if(err){
                return [err,false]
            }
            else{
                return ['Updated Successfully',true]
            }
        
        }).clone().catch(function(err){ return [err,false]});

        return getRequest;
    

}


function middlewareVerify(req,res,next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader === "undefined" || bearerHeader === ""){
        res.sendStatus(403);
    }
    else{
        req.token = bearerHeader;
        next();
    }
}

export default Router;