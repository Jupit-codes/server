import express from 'express';
import axios from "axios";
import crypto from 'crypto';
import querystring from 'querystring';
import random from 'random-number';
import { randomUUID } from 'crypto'
import moment from 'moment'
import https from 'https'
let rand = random(option_rand);
    var option_rand = {
            min: 48886
            , max: 67889
            , integer: true
        }
    var timestamp = Math.floor(new Date().getTime() / 1000);
    var time = timestamp - 240;
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
            'X-API-CODE':'3NxBbdeL3vGtSfWTa',
            'X-CHECKSUM':build,
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
        })
        .then(res=>{
            console.log(res.data)
         
        })
        .catch((error)=>{
            console.log('Error',error.response.data)
        //return [error.response.data]

    })

    // console.log(axiosCallback) ;
