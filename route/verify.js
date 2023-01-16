
import express from "express";
import Usermodel from '../model/users.js';
import KycModel from '../model/kyc.js';
import wallet_transactions from "../model/wallet_transactions.js";
import Kyc from '../model/kyc.js'
import IdCardVerification from '../model/idcardverification.js'
import Notification from "../model/notification.js";
import rate from '../model/rate.js'
import randomNumber from "random-number";
import axios from "axios";
import cloudinary from 'cloudinary'
import notification from "../model/notification.js";
import webhook from "../model/webhook.js";
import giftcard from "../model/giftcard.js";
import Crypto from 'crypto'
import nodemailer from 'nodemailer';
import giftCardnew from "../model/giftCardnew.js";
import { randomUUID } from 'crypto'
import giftcardImages from "../model/giftcardImages.js";
import giftcardtransactions from "../model/giftcardtransactions.js";
import buy_n_sell from "../model/buy_n_sell.js";
import bcrypt from 'bcryptjs'
import deposit_webhook from "../model/deposit_webhook.js";
import bank from "../model/bank.js";
import logger from "../model/logger.js";
import kyc from "../model/kyc.js";
import withdrawal from "../model/withdrawal.js";
import moment from 'moment'
import twoFactor from "../model/twoFactor.js";
import idcardverification from "../model/idcardverification.js";
import setup_pin from "../model/setup_pin.js";
import cryptoledger from "../model/cryptoledger.js";
import fiatledger from "../model/fiatledger.js";
import { SendMailClient } from "zeptomail";

cloudinary.config({ 
    cloud_name: 'jupit', 
    api_key: '848134193962787', 
    api_secret: '57S453gwuBc1_vypuLOcqYQ2V5o' 
  });

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

router.get('/me',(req,res)=>{
    // console.log('Welcome to Verify me');
    
    const url = "https://api.verified.africa/sfx-verify/v3/id-service/"
    var params = {
        "verificationType": "PASSPORT-FULL-DETAILS",
        "searchParameter": "A07011111",
        "firstName": "John",
        "lastName": "Doe",
        "dob": "1974-09-24",
        "transactionReference":""
    }
    axios.post(url,params,{ 
        headers: {
            'Content-Type': 'application/json',
            'apiKey':'Imy5g2tzop7Uwp4bzguI',
            'userid':'1641124470949',
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
    })
    .then(result=>{
        res.json(result.data)
        
    })
    .catch((error)=>{
        res.json(error.response)
    })
    
});

router.get('/cloudinary',(req,res)=>{
    let dataURI = "iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEfGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDIxLTEyLTAyPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmM1ODI0YmJmLWQxNDQtNDJhZS1hZWE4LWI0NzdjM2U2YzM2YzwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5VbnRpdGxlZCAoMTAwIHggNTAgcHgpPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPlRlbWlsb2x1d2EgT2Rld3VtaTwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkNhbnZhPC94bXA6Q3JlYXRvclRvb2w+CiA8L3JkZjpEZXNjcmlwdGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0ncic/Pk+gdhUAABP6SURBVHic7Zt7kGVXdd5/a+1z7r3d8+6Z1oy6p2eEHhgsCYUIuXgU4JSDsU0QSdkkNhgwFSgwGOEYAnawKbmAYEWWMYwE5uVSjeXExA7ENgL5JScQJ0IW5hFJhR5T0mim5z093dPd0933nL2//LHP7b49M90jYbCx01/Vmdv3nv1Ye62112vvgTWsYQ1rWMMa1rCGNaxhDWtYw//XsLGxDwOQkpkZLoHZUoPed6npYIakZW2W2hogzIyUpC1bhpMUOHHiUY4d+yXgPJ3WsAxF85k5CfHJdLLzSYOeIHvvRIwCWkhd1oTx5FCYYRICngVcA8xzLvd6AgvAwAXGTM3zrRjre+EMUvoOk/2PF4XkAahBPwP8uwu0X5D0zVXeG+DANWY2fvToiWd0Oporyy3AfwF+6jtC9D9mFGTNB+g2G2MBKHsNGv+RzCgkPSFpb+b54q7p/R1BnpL+0t2uM+ODZubuJSC2bn0Y+NVmTAfW02rVgDh0aCPw5mWEbdv2K4tTSGUzVW/KNjH+M8wmcX+IkydvWGF5o8A4cBMw2yz3C8A9KzJkZOS3mJ19HHCKYj1Q9b01zMT8/FZinGBgwHAX6jnY88JISZTlZswC8/MHmJq6acXWxbKeAMjOHj87ewMYNrOfNBP9bRpHXwI/EIL9d4lPSXRDwMyEu/vg4PCiGcx96+ReKCVjeLjm+PHlcw4MjPTRJe9/JyVV1Z+nVmsOs82cPHkf8BzgRnbuHGJ2NnDq1DcZGbkSswKoDQYtM+5VMnuNut1JBgfHqKqjxPhSjh59FgALC6cZGbmaEJzJyZNm5svmBmnHjnXp9GkH8JRWdKl9/JHWr9+eqiri3mVqauW2BUv+whvmlqzggSUmzLjjLIFJUjul9Fkzfz3wQlDIZECMNUXRSc3wPQKRwN1YvtH6sdheoGXBhpkWX2VubGB09LeBk6S0g3b7MKOjV4WiiLGqvDfG4iRSQacz5FU1pW53TEVxgpGRT3Lo0BuRoCxL3B0zl5nH5esVnY4xPe0AKdNyoYBFmNVATXbDK6NoHDrAXLP1TrF85yyOasZFwJ6zfq+Bjrs/XeJ++jjsjpVlSYz1q0EvBmaa94OS/ZF7vFPCut3iHInEuNAb52rQm5p5ctiGHU5p+Neq6kztLoaGvsbIyJc4fvzpdLtHfHaWtHGjIhRICy0z2w2MSqqAh1M6NRHCpgjQbh9xOJVAjI7exsLCApOTR8zMFWN8FfCDfXR3zLj/yBG7ra67bXfeC9pIjk7PJ5UEDAL/Z3b21O2SiHH1QLZIKWufxAeBDzeDnA8GtkzTzCxcfvkLTz766JfuMGMYLHCWMWtyk+vN7F8vG8w4DX4n4EVRnUNlkxNFM64Ae+tZrw+ZnbrZfXPtnhgYmObBB8fYvHkgAHF6+jE2bHjaj9d1fKO7PQMYBgbMLIGddl93MMbun0rscbf9VTVACNNmhtwrYNDABfP/wuycSOR/h6Dbqkqlmf082OCqHM683QHt2yGa2cxqDqd/J2gOmFu5qfWZioYrh27vJYiHgUvIwszZSM8jZfmcNjPMmG8I7JC9bG/u8y2i97lgBmbWbRq2JZ2ESnmqwKlTj7Jt2yUe40KU9JzR0Uv3AM9dpHzJyAfQFsm2mNnVwJskbhoYiO/vdqMk8y984V3pFa/4BA29p/O6cyog0QZOVVVEkiQ/4c4uYKVEK+a1aiqbLTXJ88rwPPHiswroGfzFZ+fO1xfZDzCchaGeMExCWjL9jeFU0TzQ71TOgz5HaY1gCkk9BSp6ljGlmq1bd3tKSpL/GzP7SiOMaGa1mSVJfQ/JjJTfsR54X1XN3rFly04gpuuv/03LCgDSEt15bgEKSwJWyAqX30sqJQVJLsn7ghFfYtuqG4RifPxt/d9Xb92g0/kgQ0ODpDRbdzrDpDRzLfANMwuSkCjNON3p5B233ClemKgVYGbLO5oZ7gQgplS9FOz3GmbVObAQjdlbDDLMiE0kWWRhEUGvnpw8pE5nw2tSKlVVc5ZD8/65lkpDZ5FFE1yYJIF5307oefD2Ur68qh6e13lfEBs2FJiZwYDm56e3mtkzgS9LmifnM/PA4aGhTnXy5HcvS6/r9ZTlsRij1ruHjzdmtSbvoCTJwIpGi7uAS3l3NYIJeTdbDfrp+fm5e826e7IvXNGXroQm3NJBsANmKsFq0CbgkVyxAGivOshTFsi2bbcAG4B5z9plLyBrwvPN+H5gDHgncPfk5GIh8tvaEheADQw8TlUN4d69EdhtRtXsziT1VFG3SnwG0rSZFeDXgt4tcSlYNFNgMeTnXXVd7+1256bWr9/2pAlpdl4NlCnxiRDsfVJsQ6rrOpJS0vz8CGZJIfzhqmM9RYE8l40bNzMxcZLBwQFJUNf6t3kxdk1fxnqpxHukusnKvxu7xFlY2ESMZ9aXZfHKxnSExnK4cgHtde5+ByTMQqOh+ipUfwDl50AvkqzZKVZJ2hmCvXlwcOCmC+UL/chWMm8Qs9QwoV2HUEXJMEu496rgl1xgVU8aYteunyHGyLp1g15VSlWVrgNe1jAjWs5+APbH2H3QvZc6PHWsWo0AzDyY1YQQfgzYlU0QBkpNHPAud7+jSXRDZps5UEKYqOv4U8Dx7GuWGfcX5+r0kyp8n5ey/G/0us7DmhWU5TRFMQ3sXLX3k9whN3LxxXtIqd1k3nMqig10u933A8FMdROR9HKa32u1WpOSlY0ZWYl4zi+wfZjdebZQln1zd4qioK7r65qfUnbcCqBDEp+OMWBW1yDNzByn0zHt2HFxmpjolq0Wh2LUrWb8as5P1DNbl0FnENIZLpCCr14yMR09eoAYb1mt0Tl4UjtkZGQLMSa63UlCSEVKHS0sdG8AfhiIkjWhoAqgMuP2lAIp2Xnqbv1Fwp4pK4AbF1vs3v0ZlioIS3lo/1g5DygwY10znvUN+GV3TZpVjQUzpqZuJMaNpPQGYlTKZzV8q+nrPd5LXFRVGkzpgmbWpF5Ivkwyqfc9xvsuNMY5WFUgo6OfZefOjxBCSQhGqzVYQKwlXW/GLZBzjoa4ulnQx93Lb+VQc9F82JIgMiS2xmikhMoyMTY2DLySHTtuY2TkdnJaJMA29hba5Dc9fvTSgXM4JzELoQlFa2LM+eqJEw8zMXFzX95FExovY6hdSBZNnpIaR85SPUuArc+WO2rbtp9k69b/tPpgZ+G8Arn0UnHxxT/N/PzXufbaLaQUPYS2SVbHaC8H/htYAZZy3E0ClcAxM92UUk1KKYVghGy95/oI9hy384KpqeM+Pv6p5J544om3sGPH04jxJPfc81rMzNwDZrygx+elcjxVUbRSs3v6udkzOy82mx90J0FBCH/B9u0fYmzsIjqdrZiZ5wo1W5v2iyIwY7rVsu5qJVz3wLp1g2eA/7tE22JU90+yA3dBF/fH2bbt7MrPyijgFoaHv86GDZ/jyJG3MDAwwPz8HuB5dDryr351ysyIUgC6b3bnViD04ngJZRuMS/x7CAeBsHHj5jg7O+GNNj3e08RmRyXgmk2btr1q8+Y33iFZOTZ2awxht0JINjpKkKhSqp9p5q9vzGEAi4Cb8UhKzIewGN5kVkjWZOaXpVS+3Mw/466W9JLKHaU0yvz8XICymp6eaW3Y0H5dTw69MELiW4cOPXp6bOyqZWP3QVU1aSkNCrgH9DIwSTnCA15S1/5CM/typ+Mt6coKgp7+9N+l250nhJr5+XmgNMmVUpeyLEgJxseP4WNjLdrt65if/482NLSrGBzcHtyxlJzG5EQpfT/M/RHYx8BCs+iQwzyrctmAvWa2NwTzGOfjzIyRUrbVKekPgdPNIVdTWzKAT6YUf4h8CpSy37AEVFIcA/+v5CPjuNx/cGceYzWLa78uVd8nqQuuVkukNAyk6F6zYUP7ZvIhSsxroWde/2bXrivIP50fhw/vU5O1f6WhqEdIapLN306pvoxc45JZgfQQdT3L3Ny8NXQrH4Jh2V8lRka2Lq7IsoJRZy2s1e1OFimlF6cUPw32FbCXg+rsJOX5TEpdSS3grkOHjr++qpy6jiqKNikdpNuNarVKa7XKhyX+JCdQVuf+SkAH7PMQ96SUXiRVo1J6dkp6j1m4x4yryCeRodHCQuKxuuYz119/Dee6j56DJpqx08z/p8TbpHqzWbSU7nfJro1RfwzckBNDPI9NCZqT0t6qqs8ppPbjkkt+gKKYYmHhsbuBeyXzbEV6loPL3e2vpPSLUvW0GGdaZ848jBSb+wslUne0rqcHwVRVIqXGguzcucfAFGO6xowfNWMbsAu4GnjG4lLN6sZEWc6ELTVR1ee7Xf5VUah2d280nPHxzQwNfZFO5/kmmaTqCnf7WhMV9ZKxlItwi5jJQuoVD3MdStkWxabA+DqzsNfMSvdQxbhwK9hbc+htYamuRCRXdwGOAY+QSwxX5t+tKYaamdGVaEm61T28Daw0K6sY5z5pZm9oyjHWjP/Fouj8WEoxSIopVS81s7uarN+WhLO0xST2dDqtG+bmFpBsVwh8Ani+xCnglhD4CJh1u7l6GkC1O68FfmGZvhlq7HbI1U5TzitUglzi0zMz3Tdt2lTGhpCUy+EPAx9ix467SWlaMzMHXPJHpPSzku11VwCrJRX9c4DWN1PXjaYHIGVhqARuK4rW3pSmzGzjeWIh0eQiyhEUqdn5FwEX9fx/4/96itCV1JL4Zozx3ZLhXqTVcwwR40I0a7tZ60+gexPwbsnq5jQ0NH61ktQGtksDFEUkpfhB4KV5XWwAbqkqfdFMj7jnCEnN5FUTDs4tla2hSbTU7BBrGDMp8WYo3rBuXYoSbkYKQUxPzzIz8yEAjhz5S4aGrmR6ejoVRWFF4b8D/LxkNAKuG00NOa+w1ERuAUxglYRLlBL/+cyZw2/vdueIcWCF+lg+s2nWUzclbzezZGbRTDHXfOXkfCE2JvcxKb6yKPyMewo5QjpH0mdVmtch1QphAPeLfhH4rVyGN89+FbJC5epzSgt0u6dL4IrG96amslGEwBXu+YS131z0dKJXz5eZxca+enMWUUv8jqTnuNvHoXKzVhM1JY4fNyYn37k44MTE+3jssc/Rbrc5c2ZGZu7u4cMp6Z9LPNCcI4QcHJnnPEOubONCPl/gGOiGEPzV69ZtjiG4XX75v1zBwMskS5KZZMVZ5rAJm035PSHPz12g55q1H5bcX/SiG/prJmmpb08gtngwJlWKccZifIQQ2j8r8Q5J0z0L0iSrmTArGRhYVwFHcsTZZLZASnYwJSMlw1nKgL3ZEUXOFawxU3KwY8BvSvY8d70WtC9XScvknqOFAwfezuzssrMVAA4ffichOEVRMjPTTWYphGB/EePCtaA3An8KzDaHR71kpQv8jaT3pBT/KbAnxmjQNjPXQw/97nnFkRVIDroT9H6JiUa43hwg9ZStyvPqJwYHuz8q6RgkB093330zvbMLMzpNuN6SrGzk0snkzTQ3WkzSJiuKyszSb0h6NvBrwOPNWQtAx8yI0UlJ7wX2ka9aVcAHBgfjN9evr0nJUv8lhzM9xSbf8nhU4s9zdVT3mIXj+UJMNnOtVhm73SlSGmR8/E7gXGE0bOLw4Ru5+OLNzM6KK6+8KD722DF3Lxfcy0+5tz9V19Njku/MDKBOKR2tqtP72u0tMQQnH3zFGEKBmbGwsGIqnYCQku53D7+SUvej7sVVZlwkMWTGQtZQ9q1bt+2B2dkJ8r2xrrmHFKOTL0bUCQyJj5vxJVDvNmcJOuD+BIOD48zOPp/mfoOmpyvabQvu2gfplyR9QCq/z12XmulYXc8AuHv5dZi7ViqvBY2XpT80MyPcHfeEjY7eSr6u091k5pvIV1tmrr76eZMPPHAfLF61IYDU7Xravv2LTE39ILOz2zl58jUrMeccbN36UbZvT1xxxQ7++q8P4R7CwEAnzs3Nk1KvVJ9vrMY4R1G0g0Q6ePDntH37xxgYSOzff4Lh4ZKBgSEHT/1RFoBkRUr6CPjbzfKdP/eS3nFyztBrimKEGI+Guk7RfRb3NnW9DmmWVmsjWaPnOfvkECJbtmzmZS97NXv3fpRDh97Kjh0fZWjoJGV5hhMndhjgZh5TEmY52CrLDUjzxFi7WUopJSRRFGaxL8vyomhTlm2KojNVFO0niqJz0KycvPfeu2hK0wHMUpqOBw8eSu12m9Onf4gnnph5SsIAOHnyLTz44O/zjW8cYGGhzcTE/4qzszNN3QqHxcfcC+bmZuP4+Lv17Gd/lmPHvsb+/T9HfxHyPOgtrImS2gXgUgo5RFdowlGrqgOMj783ul8NTHHw4GmOHHkT2USl5pFLKSx/8Ko6zX333bs46ZEjb+Hxx3fS7Q7wsY/9B6XU7rHYMw/l+WyoxebNz2xOMvM6u12pKCJmYnx8I7Z796eRRIwLmIWmPBuRasU4w7Oe9R7uueeXmZ4WOZT//ackhNXR49/1wA3AA8DXyBdS+uPO5XMOD3+gf4d8GOwGMzXn9zaQkn7DzN8BhJQW4pEj7wCuAg4BE+R055Pkq6YAy24o/S3xI+Q07iBwM4tpDxHYDVzXrO048BLyzd3eLryRYv/+u5ovIkcQNfBXwHrA+bM/++XvILFno5/pf/ztdt7UfO2/lb9xsdGiybm/7/V6vnu4q+/vLzSfvcBtf/P08D/O6V2srPHH/raUfRfRq7MJ4A9Ax1kKStaB7m7klaR6hTG+N/Ft3Tr5+4ZZF6lQ1v7u53M9bFkLpGj5JuIFLxZ+T+EfpEAyFivGvUCgH71LUP/gcKFr29+jEJdd9gtIgbm5ywlhdtn/b4xxmoGBqzAr2LfvFX/fxK5hDWtYwxrW8HeC/wfpN+mnlwaBHQAAAABJRU5ErkJggg==";
    var uploadStr = 'data:image/jpeg;base64,' + dataURI;
    cloudinary.v2.uploader.upload(uploadStr, {
        overwrite: true,
        invalidate: true
    },
        function (error, result) {
            if(error){
                res.json(error)
            }
            res.json(result.secure_url);
        });

})

router.post('/set/session',(req,res)=>{
   
    var passwordSess = req.session.changepwd = [];
    const item = {
        name:req.body.username,
        userid:req.body.userid,
        sex:req.body.sex
    }
    passwordSess.push(item);
    
    res.send({'message':'session-set'});
})

router.get('/check/session',(req,res)=>{

    
     if(req.session.changepwd){
        res.send(req.session.changepwd);
     }
     else{
         res.send({'message':'No Session Found'})
     }
   
})

router.post('/getChart/data',async (req,res)=>{
    let address = req.body.btcaddress;
    let dateToken = await wallet_transactions.aggregate([
        // { $match: { currency: 'BTC',order_id:'6265c9d156dbc6a0fe361daa' } },
        { $match: {
            $or:[
                {
                    from_address:address
                },
                {
                    to_address:address
                }
        
            ]
            // $and:[
            //         {
            //             currency:'BTC'
            //         },
            //         {
            //             $or:[
            //                 {
            //                     from_address:'2NA2V8TMD1Vbi4xWqfuTcsxMyQczom84mN8'
            //                 },
            //                 {
            //                     to_address:'2NA2V8TMD1Vbi4xWqfuTcsxMyQczom84mN8'
            //                 }
        
            //             ]
            //         }
                
        
            //     ]
            }
        
        },
        { $group : { 
            _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" },transactionType:"$type",currency:"$currency",from_address:"$from_address",to_address:"$to_address"}, 
            count : { $sum : 1 },
            amount: { $sum : "$amount"}
            
            
        },
            
            }, 
       { $group : { 
            _id : { year: "$_id.year", month: "$_id.month" }, 
            dailyusage: { $push: { day: "$_id.day", count: "$count",totalTransaction:"$amount",transactionType:"$_id.transactionType",currency:"$_id.currency",Send:"$_id.from_address",Receive:"$_id.to_address"}}}
            }, 

       { $group : { 
            _id : { year: "$_id.year" }, 
            monthlyusage: { $push: { month: "$_id.month", dailyusage: "$dailyusage" }}}
            }
    ])

     res.json(dateToken);
    //   console.log(dateToken);
         
        
  
})

router.get('/emptyTable',(req,res)=>{
    buy_n_sell.deleteMany({},(err,docs)=>{
        if(err){
            res.json(err)
        }
        if(docs){
            res.json('Deleted')
        }
    })
})

router.get('/others',(req,res)=>{
    wallet_transactions.updateMany(
        { order_id: '9995786465' },
        { $set: { email: 'fakoredekudus@gmail.com'}},{upsert:true}).then((result, err) => {
           return res.status(200).json({ data: result, message:"Value Updated" });
       })
})


router.post('/latest/transaction',(req,res)=>{
    let btcaddress = req.body.btcaddress;
    let usdtaddress = req.body.usdtaddress
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
           res.send(docs)
       }
       
   }).limit(4).sort({date_created: -1})
})

router.get('/aggregate',async (req,res)=>{

    let docs = await Usermodel.aggregate([
        { $match: { Pin_Created: true } },
        {
          $group: {
            _id: '$username',
            count: { $sum: 1 }
          }
        }
      ]);
    
      res.json(docs);
    //   console.log(docs);
})

router.post('/addCard',async(req,res)=>{
  

   giftCardnew.findOne({brandname:req.body.brandname},async (err,docs)=>{
       if(err){
           res.status(400).send(err);
       }
       else if(docs){
           res.status(400).send('Brand Name Already Exist');
       }
       else if(!docs){
        let createGiftcard = await giftCardnew.create({
            brandname:req.body.brandname,
            image_url:req.body.image_url
        })
        if(createGiftcard){
            req.body.countries.forEach(d => {
                
                 giftCardnew.findOneAndUpdate({_id:createGiftcard._id},{$push:{
                    countries:d
                }},(err,docs)=>{
                    if(err){
                        res.send(err);
                    }
                    
                })
                
            }); 

            req.body.rate.forEach(d => {
                
                 giftCardnew.findOneAndUpdate({_id:createGiftcard._id},{$push:{
                    rate:d
                }},(err,docs)=>{
                    if(err){
                        res.send(err);
                    }
                    
                })
                
            }); 

            res.send('Updated');
            
        } 


       }
   })
   
    
   
   
    
     
    
})

router.get('/get/allgiftcards',middlewareVerify,(req,res)=>{
    giftcard.find({},(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else{
            res.send(docs);
        }
    })
})

router.get('/giftCardApi',async (req,res)=>{

    giftCardnew.find({},(err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
            res.send(docs);
        }
        else if(!docs){
            res.status(400).send('No Card Found')
        }
    }).sort({ brandname: 'asc'})
    // let url = 'https://api-testbed.giftbit.com/papi/v1/brands'
    // axios.get(url,{ 
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization':'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJTSEEyNTYifQ==.Q0hTcTR5YzUrT0JNWGNhMGxMdWZzY0xZYTZnb3VLOEpVWmVOZ2JmZEloTmdjQm1oTkF2cFE0bFFXcnAwM0ltRG50TnRxVDBOYnV3VmJDLzk0N1o3Q080OU5ZTktYV0U2ajNXdXIxMjlpN1BQNFVzUzU2SlE1ZnI1dGZEOWVsaUk=.AR/7iJ18146bDdaWRtFPbG4HEUJo50NWG3T17gtUJ3Q=',
    //         'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
    //     }
    // })
    // .then(result=>{
    //     res.json(result.data)
        
    // })
    // .catch((error)=>{
    //     res.json(error.response)
    // })
})

router.get('/getUser',async (req,res)=>{
    Usermodel.findOne({_id:'6388b64884f97d934901bac6'},(err,docs)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send(docs);
        }
    })
})


router.post('/giftCardApi/brandname',async (req,res)=>{

    let url = 'https://api-testbed.giftbit.com/papi/v1/brands/'+req.body.mybrand;
    
    axios.get(url,{ 
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJTSEEyNTYifQ==.Q0hTcTR5YzUrT0JNWGNhMGxMdWZzY0xZYTZnb3VLOEpVWmVOZ2JmZEloTmdjQm1oTkF2cFE0bFFXcnAwM0ltRG50TnRxVDBOYnV3VmJDLzk0N1o3Q080OU5ZTktYV0U2ajNXdXIxMjlpN1BQNFVzUzU2SlE1ZnI1dGZEOWVsaUk=.AR/7iJ18146bDdaWRtFPbG4HEUJo50NWG3T17gtUJ3Q=',
            'User-Agent': 'Node.js/16.7.0 (Windows 10; x64)'
        }
    })
    .then(result=>{
        // console.log(result.data)
        res.json(result.data)
        
    })
    .catch((error)=>{
        // console.log(error.response)
        res.json(error.response)
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

router.post('/changepassword',middlewareVerify,(req,res)=>{
    let code = Crypto.randomBytes(20).toString('hex');
    let userid = req.body.userid;
    Usermodel.findOne({_id:userid},(err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){


            const mailData = {
                from: 'Jupit<hello@jupitapp.co>',  // sender address
                to: docs.email,   // list of receivers
                subject: 'Change Password',
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
                            </style>
                            
                            
                            
                            <!--[if !mso]><!-->
                            <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
                            <!--<![endif]-->
                            
                            </head>
                            
                            <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">
                            <!--[if IE]><div class="ie-container"><![endif]-->
                            <!--[if mso]><div class="mso-container"><![endif]-->
                            <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%" cellpadding="0" cellspacing="0">
                                <tbody>
                                <tr style="vertical-align: top">
                                    <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->
                            
                            
                                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                            <div style="width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                <!--<![endif]-->
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div style="color: #afb0c7; line-height: 170%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 14px; line-height: 23.8px;"></span></p>
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
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                            <div style="width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                <!--<![endif]-->
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">
                            
                                                              

                                                                <object style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 32%;max-width: 179.2px; type="image/svg+xml" data="https://res.cloudinary.com/jupit/image/upload/v1656115771/Jupit_Logo_Wordmark_mkhimf.svg" width="179.2"></object>

                            
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
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #003399;">
                                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                            <div style="width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                <!--<![endif]-->
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                            <tr>
                                                            <td style="padding-right: 0px;padding-left: 0px;" align="center">
                            
                                                                <img align="center" border="0" src="https://cdn.templates.unlayer.com/assets/1597218650916-xxxxc.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 26%;max-width: 150.8px;"
                                                                width="150.8" />
                            
                                                            </td>
                                                            </tr>
                                                        </table>
                            
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div style="color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 140%;"><strong>YOUR CHANGE PASSWORD REQUEST HAS BEEN RECEIVED !</strong></p>
                                                        </div>
                            
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 31px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div style="color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 28px; line-height: 39.2px;"><strong><span style="line-height: 39.2px; font-size: 28px;">Change Password</span></strong>
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
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                            <div style="width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                <!--<![endif]-->
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div style="line-height: 160%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 22px; line-height: 35.2px;">Dear ${docs.username},</span></p>
                                                            <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 22px; line-height: 35.2px;">Kindly click on the button below to effect the new password as requested by you.</span></p>
                                                            <p style="font-size: 14px; line-height: 160%;">&nbsp;</p>
                                                        </div>
                            
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div align="center">
                                                            <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Cabin',sans-serif;"><tr><td style="font-family:'Cabin',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://jupit.app/users/jupit/emailverification/e9p5ikica6f19gdsmqta/qvrse/" style="height:46px; v-text-anchor:middle; width:209px;" arcsize="8.5%" stroke="f" fillcolor="#ff6600"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Cabin',sans-serif;"><![endif]-->
                                                            <a href="https://jupit.app/users/jupit/changepassword/${code}/qvrse/${docs._id}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Cabin',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #ff6600; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;">
                                                            <span style="display:block;padding:14px 44px 13px;line-height:120%;"><span style="font-size: 16px; line-height: 19.2px;"><strong><span style="line-height: 19.2px; font-size: 16px;">Change Password</span></strong>
                                                            </span>
                                                            </span>
                                                            </a>
                                                            <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                                        </div>
                            
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>

                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                <tr>
                                                    <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                        
                                                    <div align="center">
                                                       
                                                      If this request was not initiated by you please ignore or contact support@jupitapp.co
                                                       
                                                    </div>
                        
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px 60px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div style="line-height: 160%; text-align: center; word-wrap: break-word;">
                                                            <p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px;">Thanks,</span></p>
                                                            <p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px;">The Jupit Support Team</span></p>
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
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #e5eaf5;">
                                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #e5eaf5;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                            <div style="width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                <!--<![endif]-->
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:41px 55px 18px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div style="color: #003399; line-height: 160%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 20px; line-height: 32px;"><strong>Get in touch</strong></span></p>
                                                            <p style="font-size: 14px; line-height: 160%;">+2348088213177</p>
                                                            <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px; color: #000000;"><a rel="noopener" href="mailto:support@jupitapp.co" target="_blank">support@jupitapp.co</a></span></p>
                                                            <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px; color: #000000;">https://www.jupitapp.co</span></p>
                                                        </div>
                            
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 33px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div align="center">
                                                            <div style="display: table; max-width:244px;">
                                                            <!--[if (mso)|(IE)]><table width="244" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:244px;"><tr><![endif]-->
                            
                            
                                                            <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                                           
                                                            <!--[if (mso)|(IE)]></td><![endif]-->
                            
                                                            <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                                           
                                                            <!--[if (mso)|(IE)]></td><![endif]-->
                            
                                                            <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                                            <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 17px">
                                                                <tbody>
                                                                <tr style="vertical-align: top">
                                                                    <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                                    <a href="https://instagram.com/jupit.app" title="Instagram" target="_blank">
                                                                        <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                                    </a>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                            <!--[if (mso)|(IE)]></td><![endif]-->
                            
                                                            <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                                            
                                                            <!--[if (mso)|(IE)]></td><![endif]-->
                            
                                                            <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                                            <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                                                <tbody>
                                                                <tr style="vertical-align: top">
                                                                    <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                                    <a href="mailto:support@jupitapp.co" title="Email" target="_blank">
                                                                        <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/email.png" alt="Email" title="Email" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
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
                                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #003399;">
                                        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->
                            
                                            <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                            <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                            <div style="width: 100% !important;">
                                                <!--[if (!mso)&(!IE)]><!-->
                                                <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                <!--<![endif]-->
                            
                                                <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                            
                                                        <div style="color: #fafafa; line-height: 180%; text-align: center; word-wrap: break-word;">
                                                            <p style="font-size: 14px; line-height: 180%;"><span style="font-size: 16px; line-height: 28.8px;">Copyrights &copy; jupitapp</span></p>
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
                    // console.log(err);
                    res.send({"message":"An Error Occurred","callback":err})
                }
                
                else{
 
                    res.send({"message":"The password reset link has been sent to your mail","callback":info,"status":true})
                    
                }
            })
            
        }
        else if(!docs){
            res.status(400).send('Userid not Found');
        }
    })
})


router.post('/addgiftcard/sell/request',middlewareVerify,(req,res)=>{
   
    const {SelectedImage} = req.body
    let unique_id = randomUUID;

    SelectedImage.forEach(async image=>{
        cloudinary.v2.uploader.upload(image, {
            overwrite: true,
            invalidate: true
        },
            function (error, result) {
                if(error){
                    res.json(error)
                }
                //res.json(result.secure_url);
                // console.log('Result',result)
                if(result){
                    // console.log('myResult',result)
                    giftcardImages.findOne({unique_id:unique_id},async (err,docs)=>{
                        if(err){
                            res.status(400).send(err);
                        }
                        else if(docs){
                             res.status(400).send('No Uniqueness')
                        }
                        else if(!docs){
                            await giftcardImages.create({
                                userid:req.body.Userid,
                                unique_id:req.body.unique_id,
                                image_url:result.secure_url,
                                status:'untreated',
                                cardname:req.body.Cardname,
                                amount_in_usd:req.body.amountInusd
                            
                            })
                        }
                    })
                }
              
            });

    })

    giftcardtransactions.findOne({unique_id:unique_id},async (err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
             res.status(400).send('No Uniqueness')
        }
        else if(!docs){
            let savetransaction = await giftcardtransactions.create({
                userid:req.body.Userid,
                unique_id:req.body.unique_id,
                country:req.body.Country,
                total:req.body.Total,
                cardname:req.body.Cardname,
                amount_in_usd:req.body.amountInusd,
                status:'untreated',
                email:req.body.Email,
                type:'Sell'
            })

            if(savetransaction){
                req.body.Cart.forEach(d => {
                
                    giftcardtransactions.findOneAndUpdate({_id:savetransaction._id},{$push:{
                        rate:d
                   }},(err,docs)=>{
                       if(err){
                           res.send(err);
                       }
                       
                   })
                   
               }); 
               res.send({
                   "message":'Sell Giftcard Request Successfully Submitted',
                   "status":true
               })
            }
        }
    })

})

router.get('/get/current/rate',(req,res)=>{
    rate.find({},(err,docs)=>{
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




router.post('/purchase/coin',(req,res)=>{
    // console.log(req.body)
    let marketPrice=0;
    if(req.body.wallet_type === "BTC"){
        Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'naira_wallet.0.balance':- req.body.ngnamount,'btc_wallet.0.balance':req.body.btcamount}},async (err,docs)=>{
            if(err){
                // console.log(err)
                res.status(400).send({
                    "message":err
                })
            }
            else if(docs){
                // res.send(docs)
                let getcurrentmarketrate = await crypomarketprice();
                //console.log('currentMarket',getcurrentmarketrate)
                if(getcurrentmarketrate[0]){
                    marketPrice = getcurrentmarketrate[1]; 
                }
                else{
                    marketPrice = 0;
                    
                }
                let cryptoLedgerDebit = await cryptoledger.create({
                    userid:req.body.userid,
                    address:'',
                    amount:- req.body.btcamount,
                    type:'Debit',
                    diff_type:'transaction',
                    transaction_fee:0,
                    currency:req.body.wallet_type,
                    email:docs.email,
                    usd_asset:marketPrice,
                    usd_rate:parseFloat(marketPrice * req.body.btcamount)
                }) 

                let fiatLedgerCredit = await fiatledger.create({
                    userid:req.body.userid,
                    email:docs.email,
                    amount:req.body.ngnamount,
                    type:'Credit',
                    diff_type:'transaction',
                    transaction_fee:0,
                    status:'completed',
                    currency:'NGN'

                }) 
                let saveStatus =  await Notification.create({
                    type:5,
                    orderid:docs._id,
                    transfertype:'Buy',
                    asset:req.body.wallet_type,
                    from_address:req.body.ngnamount,
                    to_address:docs.btc_wallet[0].address,
                    status:'Completed',
                    read:'unread',
                    date_created:new Date(),
                    initiator:req.body.btcamount,
            
                })

                await buy_n_sell.create({
                    userid:docs._id,
                    amount:req.body.ngnamount,
                    currency:req.body.wallet_type,
                    currency_worth:req.body.btcamount,
                    type:"Buy",
                    status:'Successful'

                })
                await wallet_transactions.create({
                            type:'Buy',
                            serial:req.body.userid,
                            email:docs.email,
                            order_id:req.body.userid,
                            currency:req.body.wallet_type,
                            amount:req.body.btcamount,
                            from_address:randomUUID(),
                            fees:"0",
                            to_address:req.body.to_address,
                            wallet_id:req.body.userid,
                            usdvalue:req.body.usdamount,
                            nairavalue:req.body.ngnamount,
                            marketprice:req.body.currentRate,
                            rateInnaira:req.body.buyrate,
                            status:'Transaction Completed' 
                })

                let currency = req.body.wallet_type;
                let amount = req.body.btcamount;
                let username = docs.username;

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
                                <strong>BUY NOTIFICATION</strong>
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
                                <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;">You have successfully purchase a sum of ${amount} ${currency} into your jupit ${currency} wallet.</span></p>
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
                            let recipentaddr = docs.email
                            let subject = "Buy Notification"
                            let zep = await zeptomailSend(data,recipentaddr,subject)
    
                res.send({
                    "message":'BTC Coin Successfully Purchased',
                    "status":true
                })
            }
        })
    }
    else if(req.body.wallet_type === "USDT"){
        Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'naira_wallet.0.balance':- req.body.ngnamount,'usdt_wallet.0.balance':req.body.btcamount}},async (err,docs)=>{
            if(err){
                // console.log(err)
                res.status(400).send({
                    "message":err
                })
            }
            else if(docs){
               
                let getcurrentmarketrate = await crypomarketprice();
               
                if(getcurrentmarketrate[0]){
                    marketPrice = getcurrentmarketrate[2]; 
                }
                else{
                    marketPrice = 0;
                }
                let cryptoLedgerDebit = await cryptoledger.create({
                    userid:req.body.userid,
                    address:'',
                    amount:- req.body.btcamount,
                    type:'Debit',
                    diff_type:'transaction',
                    transaction_fee:0,
                    currency:req.body.wallet_type,
                    email:docs.email,
                    usd_asset:marketPrice,
                    usd_rate:parseFloat(marketPrice * req.body.btcamount)
                }) 

                let fiatLedgerCredit = await fiatledger.create({
                    userid:req.body.userid,
                    email:docs.email,
                    amount:req.body.ngnamount,
                    type:'Credit',
                    diff_type:'transaction',
                    transaction_fee:0,
                    status:'completed',
                    currency:'NGN'

                }) 
                
                let saveStatus =  await Notification.create({
                    type:5,
                    orderid:docs._id,
                    transfertype:'Buy',
                    asset:req.body.wallet_type,
                    from_address:req.body.ngnamount,
                    to_address:docs.usdt_wallet[0].address,
                    status:'Completed',
                    read:'unread',
                    date_created:new Date(),
                    initiator:req.body.btcamount,
            
                })
                await buy_n_sell.create({
                    userid:docs._id,
                    amount:req.body.ngnamount,
                    currency:req.body.wallet_type,
                    currency_worth:req.body.btcamount,
                    type:"Buy"

                })
                
                await wallet_transactions.create({
                    type:'Buy',
                            serial:req.body.userid,
                            order_id:req.body.userid,
                            currency:req.body.wallet_type,
                            amount:req.body.btcamount,
                            from_address:randomUUID(),
                            fees:"0",
                            to_address:req.body.to_address,
                            wallet_id:req.body.userid,
                            usdvalue:req.body.usdamount,
                            nairavalue:req.body.ngnamount,
                            marketprice:req.body.currentRate,
                            rateInnaira:req.body.buyrate,
                            status:'Transaction Completed' 
        })
    
                res.send({
                    "message":'USDT Coin Successfully Purchased',
                    "status":true
                })
            }
        })
    }
    
})




router.post('/sell/coin',(req,res)=>{
    let marketPrice = 0;
    if(req.body.wallet_type === "BTC"){
        Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'naira_wallet.0.balance': req.body.ngnamount,'btc_wallet.0.balance': - req.body.btcamount}},async (err,docs)=>{
            if(err){
                // console.log(err)
                res.status(400).send({
                    "message":err
                })
            }
            else if(docs){
                // res.send(docs)
                
                let getcurrentmarketrate = await crypomarketprice();
                //console.log('currentMarket',getcurrentmarketrate)
                if(getcurrentmarketrate[0]){
                    marketPrice = getcurrentmarketrate[1]; 
                }
                else{
                    marketPrice = 0;
                    
                }


                let cryptoLedgerCredit = await cryptoledger.create({
                    userid:req.body.userid,
                    address:'',
                    amount:req.body.btcamount,
                    type:'Credit',
                    diff_type:'transaction',
                    status:'completed',
                    transaction_fee:0,
                    currency:req.body.wallet_type,
                    email:docs.email,
                    usd_asset:marketPrice,
                    usd_rate:parseFloat(marketPrice * req.body.btcamount )

                }) 

                let fiatLedgerDebit = await fiatledger.create({
                    userid:req.body.userid,
                    email:docs.email,
                    amount: -req.body.ngnamount,
                    type:'Debit',
                    transaction_fee:0,
                    diff_type:'transaction',
                    status:'completed',
                    currency:'NGN'

                }) 

                let saveStatus =  await Notification.create({
                    type:5,
                    orderid:docs._id,
                    transfertype:'Sell',
                    asset:req.body.wallet_type,
                    from_address:req.body.ngnamount,
                    to_address:docs.btc_wallet[0].address,
                    status:'Completed',
                    read:'unread',
                    date_created:new Date(),
                    initiator:req.body.btcamount,
            
                })

                await buy_n_sell.create({
                    userid:docs._id,
                    amount:req.body.ngnamount,
                    currency:req.body.wallet_type,
                    currency_worth:req.body.btcamount,
                    type:"Sell",
                    status:"Successful"

                })

                await wallet_transactions.create({
                            type:'Sell',
                            serial:req.body.userid,
                            email:docs.email,
                            order_id:req.body.userid,
                            currency:req.body.wallet_type,
                            amount:req.body.btcamount,
                            from_address:req.body.from_address,
                            fees:"0",
                            to_address:randomUUID(),
                            wallet_id:req.body.userid,
                            usdvalue:req.body.usdamount,
                            nairavalue:req.body.ngnamount,
                            marketprice:req.body.currentRate,
                            rateInnaira:req.body.sellrate,
                            status:'Transaction Completed' 
                })
                let currency = req.body.wallet_type;
                let amount = req.body.btcamount;
                let username = docs.username;

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
                                <strong>SELL NOTIFICATION</strong>
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
                                <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;">You have successfully sold a sum of ${amount} ${currency} from your jupit wallet.</span></p>
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
                            let recipentaddr = docs.email
                            let subject = "Sell Notification"
                            let zep = await zeptomailSend(data,recipentaddr,subject)
                res.send({
                    "message":'BTC Coin Successfully Sold',
                    "status":true
                })
            }
        })
    }
    else if(req.body.wallet_type === "USDT"){
        Usermodel.findOneAndUpdate({_id:req.body.userid},{$inc:{'naira_wallet.0.balance':req.body.ngnamount,'usdt_wallet.0.balance':- req.body.btcamount}},async (err,docs)=>{
            if(err){
                // console.log(err)
                res.status(400).send({
                    "message":err
                })
            }
            else if(docs){
                // res.send(docs)
                if(getcurrentmarketrate[0]){
                    marketPrice = getcurrentmarketrate[2]; 
                }
                else{
                    marketPrice = 0;  
                }
                let cryptoLedgerCredit = await cryptoledger.create({
                    userid:req.body.userid,
                    address:'',
                    amount:req.body.btcamount,
                    type:'Credit',
                    diff_type:'transaction',
                    status:'completed',
                    transaction_fee:0,
                    currency:req.body.wallet_type,
                    email:docs.email,
                    usd_asset:marketPrice,
                    usd_rate:parseFloat(marketPrice * req.body.btcamount )

                }) 

                let fiatLedgerDebit = await fiatledger.create({
                    userid:req.body.userid,
                    email:docs.email,
                    amount: -req.body.ngnamount,
                    type:'Debit',
                    transaction_fee:0,
                    diff_type:'transaction',
                    status:'completed',
                    currency:'NGN'

                }) 
                let saveStatus =  await Notification.create({
                    type:5,
                    orderid:docs._id,
                    transfertype:'Sell',
                    asset:req.body.wallet_type,
                    from_address:req.body.ngnamount,
                    to_address:docs.usdt_wallet[0].address,
                    status:'Completed',
                    read:'unread',
                    date_created:new Date(),
                    initiator:req.body.btcamount,
            
                })
                await buy_n_sell.create({
                    userid:docs._id,
                    amount:req.body.ngnamount,
                    currency:req.body.wallet_type,
                    currency_worth:req.body.btcamount,
                    type:"Sell"

                })

                await wallet_transactions.create({
                    type:'Sell',
                    serial:req.body.userid,
                    order_id:req.body.userid,
                    currency:req.body.wallet_type,
                    amount:req.body.btcamount,
                    from_address:req.body.from_address,
                    fees:"0",
                    to_address:randomUUID(),
                    wallet_id:req.body.userid,
                    usdvalue:req.body.usdamount,
                    nairavalue:req.body.ngnamount,
                    marketprice:req.body.currentRate,
                    rateInnaira:req.body.sellrate,
                    status:'Transaction Completed' 
        })

        let currency = req.body.wallet_type;
                let amount = req.body.btcamount;
                let username = docs.username;

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
                                <strong>SELL NOTIFICATION</strong>
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
                                <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;">You have successfully sold a sum of ${amount} ${currency} from your jupit wallet.</span></p>
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
                            let recipentaddr = docs.email
                            let subject = "Sell Notification"
                            let zep = await zeptomailSend(data,recipentaddr,subject)

    

                res.send({
                    "message":'USDT Coin Successfully Sold',
                    "status":true
                })
            }
        })
    }
})

router.post('/change/wallet/pin',(req,res)=>{
    // console.log(req.body)
    Usermodel.findOne({_id:req.body.userid},(err,docs)=>{
        if(err){
            // console.log(err)
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            // console.log(docs.wallet_pin)
            let validPin = bcrypt.compareSync(req.body.oldpin, docs.wallet_pin);
                if(validPin){
                    const salt =  bcrypt.genSaltSync(10);
                    let new_pin =  bcrypt.hashSync(req.body.newpin, salt)
                    Usermodel.findOneAndUpdate({_id:req.body.userid},{$set:{'wallet_pin':new_pin}},(err,docs)=>{
                        if(err){
                            res.status(400).send({
                                "message":"Change Pin Failed",
                                "status":false
                            })
                        }
                        else if(docs){
                            res.send({
                                "message":"Pin Has been Successfully Changed",
                                "status":true
                            })
                        }
                    })
                }
                else{
                    res.status(400).send({
                        "message":'Invalid Old Pin',
                        "status":false
                    })
                }
            
        }
    })
})

router.post('/check/pin',(req,res)=>{
    // if(err){
    //     res.status(400).send({
    //         "message":err,
    //         "status":false
    //     })
    // }
    Usermodel.findOne({_id:req.body.userid},(err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
                "status":false
            })
        }
        else if(docs){
            const validPassword = bcrypt.compareSync(req.body.walletpin, docs.wallet_pin);
            if(validPassword){
                res.send({
                    "message":"Pin Verified",
                    "status":true
                })
            }
            else{
                res.status(400).send({
                    "message":"Invalid Pin",
                    "status":false
                })
            }
        }
    })

})

router.post('/catch/deposit/response',verifyResponse,(req,res)=>{

    //res.status(200).end();

    console.log(req.body)

    deposit_webhook.findOne({reference:req.body.reference},async (err,docs)=>{
        if(err){
            // res.status(400).send({
            //     "message":err,
            //     "status":false
            // })
            res.send({
                'status': true,
                'message': "",
                "response_code": "02"
            })
        }
        else if(docs){
            res.send({
                'status': true,
                'message': "",
                "response_code": "01"
            })
        }
        else if(!docs){
            await deposit_webhook.create({
                reference:req.body.reference,
                account_number:req.body.account_number,
                amount:req.body.amount,
                status:'successful'

            })
            
            await Usermodel.findOneAndUpdate({virtual_account:req.body.account_number},{$inc:{'naira_wallet.0.balance':req.body.amount}}).exec();

            await notification.create({
                type:13,
                orderid:req.body.reference,
                transfertype:'Naira Wallet Deposit',
                asset:"Naira",
                from_address:req.body.amount,
                to_address:req.body.account_number,
                status:'Completed',
                read:'unread',
                date_created:new Date(),
                initiator:req.body.reference,
        
            })
            Usermodel.findOne({virtual_account:req.body.account_number},async(err,docs)=>{
               if(err){
                await wallet_transactions.create({
                    type:'Deposit',
                    serial:req.body.account_number,
                    order_id:'N/A/E',
                    currency:'Naira',
                    amount:req.body.amount,
                    from_address:req.body.reference,
                    fees:"0",
                    to_address:req.body.account_number,
                    status:'Transaction Completed' 
                })

               

               }
               else if(docs){
                await wallet_transactions.create({
                    type:'Deposit',
                    serial:req.body.account_number,
                    order_id:docs._id,
                    currency:'Naira',
                    amount:req.body.amount,
                    from_address:req.body.reference,
                    fees:"0",
                    to_address:req.body.account_number,
                    status:'Transaction Completed' 
                })

                let currency = "NGN";
                let amount = req.body.amount;
                let username = docs.username;

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
                                <strong>DEPOSIT ALERT</strong>
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
                                <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;">You have successfully received a sum of ${amount} ${currency} into your jupit ${currency} wallet.</span></p>
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
                            let recipentaddr = docs.email
                            let subject = "Deposit Alert"
                            let zep = await zeptomailSend(data,recipentaddr,subject)

                

               }
               else{
                await wallet_transactions.create({
                    type:'Deposit',
                    serial:req.body.account_number,
                    order_id:'N/A',
                    currency:'Naira',
                    amount:req.body.amount,
                    from_address:req.body.reference,
                    fees:"0",
                    to_address:req.body.account_number,
                    status:'Transaction Completed' 
                })
               }

               
    
            })
            

            res.send({
                'status': true,
                'message': "",
                "response_code": "00"
            })

        }
    })

    
})




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



function verifyResponse(req,res,next){
    const bearerHeader = req.headers['authorization'];
    
    if(typeof bearerHeader === "undefined" || bearerHeader === ""){
        console.log('A false Webhook Forbidden')
        const bearerToken = bearerHeader.split(' ')[1];
        console.log('Bearer',bearerToken);
        res.sendStatus(403);

    }
    else{
        const bearerToken = bearerHeader.split(' ')[1];
        console.log('Bearer',bearerToken);
        
        let token = "8f9838f22b7d7545562135370af912f21204178229f1820bed178cd58578120301602c200c58b2894a6c5be2d0b55e40c451845739c4f197692aefc579078d2a"
        if(token == bearerToken){
            console.log('Token passed')
            req.token = bearerToken;
            next();
        }
        else{
            console.log('Not Equals')
            res.sendStatus(403);
            
        }
        
    }
}

router.get('/test/immutable',async(req,res)=>{
   let x = await Usermodel.findOneAndUpdate({_id:'6388b64884f97d934901bac6','naira_wallet.0.balance':{$gte: 0}},{$inc:{'naira_wallet.0.balance': 1000}}).exec();
    res.send(x)
})

router.post('/client/withdrawal',(req,res)=>{
   // res.send(req.body)
    
    bank.findOne({email:req.body.email},async (err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else if(docs){
            var option_rand = {
                min: 48886
                , max: 1000000000
                , integer: true
            }
            let amount_with_charge = parseFloat(req.body.amount) + parseFloat(req.body.charge)
             let debitWallet = await Usermodel.findOneAndUpdate({_id:req.body.userid,'naira_wallet.0.balance':{$gte: 0}},{$inc:{'naira_wallet.0.balance':- amount_with_charge}}).exec();
             let rand = randomNumber(option_rand);
             
            
            if(debitWallet){
                await withdrawal.create({
                    username:debitWallet.username,
                    userid:req.body.userid,
                    amount:req.body.amount,
                    account_number:docs.account_number,
                    account_name:docs.account_name,
                    bank_code:docs.bank_code,
                    email:req.body.email,
                    type:'Withdrawal',
                    currency_worth:amount_with_charge,
                    status:'Pending',
                    ref_number:rand
                })

                

                const url = "https://live.purplepayapp.com/v1/transfer/"
                var params = {
                    
                        "account_number": docs.account_number,
                        "account_name": docs.account_name,
                        "bank_code": docs.bank_code,
                        "amount": req.body.amount,
                        "first_name": req.body.firstname,
                        "last_name": req.body.lastname,
                        "email": req.body.email,
                        "phone_number": req.body.phonenumber,
                        "msg": "Jupit Customer Withdrawal"
                        
                }
                
                
                axios.post(url,params,{ 
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'bearer 8f9838f22b7d7545562135370af912f21204178229f1820bed178cd58578120301602c200c58b2894a6c5be2d0b55e40c451845739c4f197692aefc579078d2a '
                    }
                })
                .then(result=>{
                   console.log('result',result.data.status)
                    let amount_with_charge = parseFloat(req.body.amount) + parseFloat(req.body.charge)
                    if(result.data.status){
                        
                        Usermodel.findOne({_id:req.body.userid},async (err,document)=>{
                            if(err){
                                res.status(400).send('Internal Server Error')
                            }
                            else if(document){

                                let updateWithdrawal = await withdrawal.findOneAndUpdate({$and:[{userid:req.body.userid},{ref_number:rand},{currency_worth:amount_with_charge}]},{$set:{'status':'Successful'}}).exec();

                                let saveStatus =  await Notification.create({
                                    type:7,
                                    orderid:req.body.phonenumber,
                                    transfertype:'Withdrawal',
                                    asset:amount_with_charge,
                                    from_address:req.body.firstname,
                                    to_address:req.body.lastname,
                                    status:'Completed',
                                    read:'unread',
                                    date_created:new Date(),
                                    initiator:req.body.email,
                                })
                                
                                await wallet_transactions.create({
                                    type:'Withdrawal',
                                    serial:document.virtual_account,
                                    order_id:document.virtual_account,
                                    email:req.body.email,
                                    currency:'Naira',
                                    amount:amount_with_charge,
                                    from_address:document.virtual_account,
                                    fees:"0",
                                    to_address:docs.account_number,
                                    status:'Transaction Completed' 
                        })
                        
    
                            fiatledger.create({
                                userid:req.body.userid,
                                email:req.body.email,
                                amount:req.body.amount,
                                transaction_fee:req.body.charge,
                                type:"Credit",
                                diff_type:'transaction-fee',
                                status:'Transaction Completed'
                            })
    
                            let currency = "NGN";
                            let amount = req.body.amount;
                            let username = document.username;
            
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
                                            <strong>WITHDRAWAL NOTIFICATION</strong>
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
                                            <p style="font-size: 14px; line-height: 160%;"><span style="font-family: Raleway, sans-serif; font-size: 16px; line-height: 25.6px;">You have successfully withdrawal a sum of ${amount} ${currency} from your jupit ${currency} wallet.</span></p>
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
                                        let recipentaddr = docs.email
                                        let subject = "Withdrawal Notification"
                                        let zep = await zeptomailSend(data,recipentaddr,subject)
                                res.send('Withdrawal Success');
                            }
                        })
                    }
                    else if(!result.data.status && result.data.code == "02"  ){
                        let updateWithdrawal =  withdrawal.findOneAndUpdate({$and:[{userid:req.body.userid},{ref_number:rand},{amount:amount_with_charge}]},{$set:{'status':'Failed'}}).exec();
                        res.status(400).send("Failed Request..Pls Try Again");
    
                    }
                    else if(!result.data.status && result.data.code == "01"  ){
                        let updateWithdrawal =  withdrawal.findOneAndUpdate({$and:[{userid:req.body.userid},{ref_number:rand},{amount:amount_with_charge}]},{$set:{'status':'Failed'}}).exec();
                        res.status(400).send("Failed Request..Pls Try Again")
                        // sendremindermail();
                    }
    
                    
                    
                    
                })
                .catch((error)=>{
                    console.log('error',error.response)
                    res.status(400).send(error)
                    
                    
                })


            }
            else{
                res.status(400).send('Wallet Balance Error')   
            }

             
             
            //const valueNew = parseFloat(req.body.amount) - parseFloat(req.body.charge);
           // console.log('valueNew',valueNew);
           
        }
        else if(!docs){
            // await walletReminder();
            res.status(400).send('Bank Details not found..Complete your KYC Level 2');
        }
    })

    
})

router.post('/transaction/history',(req,res)=>{
   
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let type = req.body.type;
    let currency = req.body.asset;
    let status = req.body.status;
    let userid = req.body.userId;
    let query = [];

    let momentstart = moment(startDate).startOf('day');
    let momentend = moment(endDate).endOf('day');

    if(startDate && endDate ){
        query.push({
            updated: {
                // $gte: new Date(new Date(startDate)),
                // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
                  $gte: momentstart,
                $lt: momentend
            }
        })  

    }

    if(userid){
        query.push(
            {
                order_id:userid
            }
            )
    }

    if(status){
         if(status !== "All"){
            query.push({ type:req.body.status})
         }
         else{
            query.push(
                {
                    $or:[
                        {
                            type:'Sell'
                        },
                        {
                            type:'Buy'
                        },
                        {
                            type:'Receive'
                        },
                        {
                            type:'Send'
                        }
                    ]
                }
            )
         }
        
    }

    if(currency){
        if(currency !== "All"){
            query.push({
                currency:req.body.asset
            })
        }
        else{
            query.push(
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
            )
        }
        
    }

    if(type){
        query.push({
            type:req.body.type
        })
    }

    console.log("history",query)
    console.log("hostorybody",req.body)
    
    if(query.length > 0){

        Usermodel.findOne({_id:userid},async (err,docs)=>{
            if(err){
                res.status(400).send(err);
            }
            else if(docs){

                await wallet_transactions.find({

                    $and:[
                     {
                         $or:[
                             {
                                 order_id:userid
                             },
                             {
                                from_address:docs.btc_wallet[0].address
                            },
                            {
                                from_address:docs.usdt_wallet[0].address
                            },
                            {
                                to_address:docs.usdt_wallet[0].address
                            },
                            {
                                to_address:docs.btc_wallet[0].address
                            },
                         ]
                     },
                     {
                         $and:query
                     }
                    ]
                   
                    },(err,docs)=>{
                        if(err){
                            res.send(err)
                        }
                        else{
                            res.send(docs)
                        }
                    }).sort({ updated: 'asc'}).clone().catch(function(err){ return [err,false]});

            }
        }).clone().catch(function(err){ return [err,false]});
       
   

    }
    else{
        Usermodel.findOne({_id:userid},async (err,docs)=>{
            if(err){
                res.status(400).send(err)
            }
            else if(docs){
                await wallet_transactions.find({
                    $or:[
                        {
                            order_id:userid
                        },
                        {
                           from_address:docs.btc_wallet[0].address
                       },
                       {
                           from_address:docs.usdt_wallet[0].address
                       },
                       {
                           to_address:docs.usdt_wallet[0].address
                       },
                       {
                           to_address:docs.btc_wallet[0].address
                       },
                    ]
        
                },(err,docs)=>{
                       if(err){
                           res.send(err)
                       }
                       else{
                           res.send(docs)
                       }
                   }).sort({ updated: 'asc'}).clone().catch(function(err){ return [err,false]});
            }
        }).clone().catch(function(err){ return [err,false]});
        
    }
    
        
})



router.post('/filter',(req,res)=>{
   
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let type = req.body.type;
    let currency = req.body.asset;
    let status = req.body.status;
    let userid= req.body.userid;

    let momentstart  = moment(startDate).startOf('day')
    let momentend = moment(endDate).endOf('day').toDate();

    let query = [];

    if(startDate && endDate ){
        query.push({
            updated: {
                // $gte: new Date(new Date(startDate)),
                // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
                  $gte: momentstart,
                    $lt: momentend
            }
        })  

    }

    if(userid){
        query.push(
            {
                order_id:req.body.userid
            }
            )
    }

    if(status){
         if(status !== "All"){
            query.push(
                {
                    type:req.body.status
                }
                )
         }
         else{
            query.push(
                {
                    $or:[
                        {
                            type:'Sell'
                        },
                        {
                            type:'Buy'
                        },
                        {
                            type:'Receive'
                        },
                        {
                            type:'Send'
                        }
                    ]
                }
            )
         }
        
    }

    if(currency){
        if(currency !== "All"){
            query.push({
                currency:req.body.asset
            })
        }
        else{
            query.push(
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
            )
        }
        
    }

    if(type){
        query.push({
            type:req.body.type
        })
    }
    console.log('Query',query)
    if(query.length > 0){
        console.log('Greater',query)
    const x = wallet_transactions.find({
        $and:query
      
       },(err,docs)=>{
           if(err){
               res.send(err)
           }
           else{
               res.send(docs)
           }
       }).sort({ date_created: 'asc'})

    }
    else{
        const x = wallet_transactions.find({},(err,docs)=>{
               if(err){
                   res.send(err)
               }
               else{
                   res.send(docs)
               }
           }).sort({ date_created: 'asc'})
    }
    
        
})


//filtercryptoledger
router.post('/filtercryptoledger',(req,res)=>{
   
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    // let type = req.body.type;
    let currency = req.body.asset;
    // let status = req.body.status;
    // let userid= req.body.userid;

    let momentstart = moment(startDate).startOf('day')
    let momentend = moment(endDate).endOf('day').toDate();

    let query = [];

    if(startDate && endDate ){
        query.push({
            date_created: {
                // $gte: new Date(new Date(startDate)),
                // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
                  $gte: momentstart,
                $lt: momentend
            }
        })  

    }

    // if(userid){
    //     query.push(
    //         {
    //             order_id:req.body.userid
    //         }
    //         )
    // }

    // if(status){
    //      if(status !== "All"){
    //         query.push(
    //             {
    //                 type:req.body.status
    //             }
    //             )
    //      }
    //      else{
    //         query.push(
    //             {
    //                 $or:[
    //                     {
    //                         type:'Sell'
    //                     },
    //                     {
    //                         type:'Buy'
    //                     },
    //                     {
    //                         type:'Receive'
    //                     },
    //                     {
    //                         type:'Send'
    //                     }
    //                 ]
    //             }
    //         )
    //      }
        
    // }

    if(currency){
        if(currency !== "All"){
            query.push({
                currency:req.body.asset
            })
        }
        else{
            query.push(
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
            )
        }
        
    }

    // if(type){
    //     query.push({
    //         type:req.body.type
    //     })
    // }
    
    if(query.length > 0){
       
    const x = cryptoledger.find({
        $and:query
      
       },(err,docs)=>{
           if(err){
               res.send(err)
           }
           else{
               res.send(docs)
           }
       }).sort({ date_created: 'asc'})

    }
    else{
        const x = cryptoledger.find({},(err,docs)=>{
               if(err){
                   res.send(err)
               }
               else{
                   res.send(docs)
               }
           }).sort({ date_created: 'asc'})
    }
    
        
})

//filterfiatledger

router.post('/filterfiatledger',async(req,res)=>{
   
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    // let type = req.body.type;
    let currency = req.body.asset;
    // let status = req.body.status;
    // let userid= req.body.userid;
    console.log(req.body)
    let query = [];
    let momentum_start = moment(startDate.split('T')[0]).startOf('day').toDate()
    let momentum_end = moment(endDate.split('T')[0]).endOf('day').toDate()

    if(startDate && endDate ){
        query.push({
            updated: {
                // $gte: new Date(new Date(startDate)),
                // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
                  $gte: momentum_start,
                $lt: momentum_end
            }
        })  

    }

    // if(userid){
    //     query.push(
    //         {
    //             order_id:req.body.userid
    //         }
    //         )
    // }

    // if(status){
    //      if(status !== "All"){
    //         query.push(
    //             {
    //                 type:req.body.status
    //             }
    //             )
    //      }
    //      else{
    //         query.push(
    //             {
    //                 $or:[
    //                     {
    //                         type:'Sell'
    //                     },
    //                     {
    //                         type:'Buy'
    //                     },
    //                     {
    //                         type:'Receive'
    //                     },
    //                     {
    //                         type:'Send'
    //                     }
    //                 ]
    //             }
    //         )
    //      }
        
    // }

    if(currency){
        if(currency !== "All"){
            query.push({
                currency:req.body.asset
            })
        }
        else{
            query.push(
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
            )
        }
        
    }

    // if(type){
    //     query.push({
    //         type:req.body.type
    //     })
    // }
    
    if(query.length > 0){
        
       let sumFiatLedger = await fiatledger.aggregate([
        
            { $match: {
                
                  $and:query
              
                }
            
            },
            { 
                $group : { 
                    _id:{},
                    amount: { 
                        // $sum : "$amount"
                        $sum: {
                            "$toDouble": "$amount"
                          }
                    } 
                    
                },
                
            }, 
          
        ])

       
        console.log(sumFiatLedger)
    
    
    const x = fiatledger.find({
        $and:query
      
       },(err,docs)=>{
           if(err){
               res.send(err)
           }
           else{
               res.send({
                data:docs,
                sumTotal:sumFiatLedger.length > 0 ? sumFiatLedger[0].amount : 0
               })
           }
       }).sort({ updated: 'desc'})

    }
    else{
        const x = fiatledger.find({},(err,docs)=>{
               if(err){
                   res.send(err)
               }
               else{
                   res.send(docs)
               }
           }).sort({ updated: 'desc'})
    }
    
        
})


router.post('/filter/deposit',(req,res)=>{
  
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let status = req.body.status;
    let virtual_account= req.body.virtualacct;
    let momentstart = moment(startDate).startOf('day')
    let momentend = moment(endDate).endOf('day').toDate();
    let query = [];

    if(startDate && endDate ){
        query.push({
            updated: {
                // $gte: new Date(new Date(startDate)),
                // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
                  $gte: momentstart,
                $lt: momentend
            }
        })  

    }

    if(virtual_account){
        query.push(
            {
                account_number:req.body.virtualacct
            }
            )
    }

    if(status){
        query.push(
            {
                status:req.body.status
            }
            )
    }

   
    if(query.length > 0){
        
    const x = deposit_webhook.find({
        $and:query
      
       },(err,docs)=>{
           if(err){
               res.send(err)
           }
           else{
               res.send(docs)
           }
       }).sort({ updated: -1})

    }
    else{
        const x = deposit_webhook.find({},(err,docs)=>{
               if(err){
                   res.send(err)
               }
               else{
                   res.send(docs)
               }
           }).sort({ updated: -1})
    }
    
        
})



router.post('/filter/tradelogs',(req,res)=>{
  
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    // let startDate = '2022-06-11';
    // let endDate = '2022-06-13';
    let status = req.body.status;
    let currency= req.body.asset;
    let type= req.body.type;
    let userid= req.body.getUserid
    let query = [];

    
    if(startDate && endDate ){
        query.push({
            date_created: {
                // $gte: new Date(new Date(startDate)),
                // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
                  $gte: new Date(startDate),
                $lt: new Date(endDate).setHours(23, 59, 59)
            }
        })  

    }

    

    if(status){
        query.push(
            {
                status:req.body.status
            }
            )
    }

    if(currency){
        query.push({
            currency:req.body.asset
        })
    }

    if(type){
        query.push({
            type:req.body.type
        })
    }

   


    let x = Usermodel.findOne({_id:userid},(err,docs)=>{
        if(err){
            res.status(400).send({
                "message":err,
            "status":false            })
        }
        else if(docs){

            if(query.length > 0){

                let btcaddress = docs.btc_wallet[0].address;
                let usdtaddress = docs.usdt_wallet[0].address; 
                wallet_transactions.find({
                    $and:[
                            {
                                $or:[
                                    {
                                        from_address:btcaddress
                                    },
                                    {
                                        to_address:btcaddress
                                    },
                                    {
                                        from_address:usdtaddress
                                    },
                                    {
                                        to_address:usdtaddress
                                    }
                                ]
                            },
                            {
                                $and:query
                            }
                            // {
                            //     $or:[
                            //         {
                            //             from_address:usdtaddress
                            //         },
                            //         {
                            //             to_address:usdtaddress
                            //         }
                            //     ]
                                
                                
                            // }
                           

                        ]
                   },(err,docs)=>{
                       if(err){
                           res.status(400).send(err)
                       }
                       else if(docs){
                           res.send(docs)
                       }
                       
                   }).sort({date_created: -1})

            }
            else{
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
                           res.send(docs)
                       }
                       
                   }).sort({date_created: -1})

            }
               
               
        }
        else if(!docs){
            res.status(400).send({
                "message":"Invalid Request",
                "status":false
            })
        }
    })

    // let query = [];

    // if(startDate && endDate ){
    //     query.push({
    //         updated: {
    //             // $gte: new Date(new Date(startDate)),
    //             // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
    //               $gte: new Date(startDate),
    //             $lt: new Date(endDate).setHours(23, 59, 59)
    //         }
    //     })  

    // }

    // if(virtual_account){
    //     query.push(
    //         {
    //             account_number:req.body.virtualacct
    //         }
    //         )
    // }

    // if(status){
    //     query.push(
    //         {
    //             status:req.body.status
    //         }
    //         )
    // }

   
    // if(query.length > 0){
        
    // const x = deposit_webhook.find({
    //     $and:query
      
    //    },(err,docs)=>{
    //        if(err){
    //            res.send(err)
    //        }
    //        else{
    //            res.send(docs)
    //        }
    //    }).sort({ date_created: 'asc'})

    // }
    // else{
    //     const x = deposit_webhook.find({},(err,docs)=>{
    //            if(err){
    //                res.send(err)
    //            }
    //            else{
    //                res.send(docs)
    //            }
    //        }).sort({ date_created: 'asc'})
    // }
    
        
})


router.post('/filter/withdrawal',(req,res)=>{
   
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let userid = req.body.userid;
    let email = req.body.email;
    let accountnumber = req.body.accountnumber;
    let status = req.body.status;

    let momentstart = moment(startDate).startOf('day')
    let momentend = moment(endDate).endOf('day').toDate();
  

    let query = [];

    if(startDate && endDate ){
        query.push({
            updated: {
                // $gte: new Date(new Date(startDate)),
                // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
                  $gte: momentstart,
                $lt: momentend
            }
        })  

    }

    if(userid){
        query.push(
            {
                userid:req.body.userid
            }
            )
    }

    if(status){
        query.push(
            {
                type:req.body.status
            }
            )
    }

    if(email){
        query.push({
            email:req.body.email
        })
    }

    if(accountnumber){
        query.push({
            account_number:req.body.accountnumber
        })
    }

    if(query.length > 0){
        
    const x = withdrawal.find({
        $and:query
      
       },(err,docs)=>{
           if(err){
               res.send(err)
           }
           else{
               res.send(docs)
           }
       }).sort({ date_created: 'asc'})

    }
    else{
        const x = withdrawal.find({},(err,docs)=>{
               if(err){
                   res.send(err)
               }
               else{
                   res.send(docs)
               }
           }).sort({ date_created: 'asc'})
    }
    
        
})


router.post('/addgiftcard/buy/request',middlewareVerify,(req,res)=>{
   
    const {SelectedImage} = req.body
    let unique_id = randomUUID;

    Usermodel.findOne({_id:req.body.Userid},async(err,docs)=>{
        if(err){
            res.status(400).send('User Not Found');
        }
        else if(docs){
            let savetransaction =  await giftcardtransactions.create({
                userid:req.body.Userid,
                email:req.body.Email,
                unique_id:"Uni00012",
                country:req.body.Country,
                total:req.body.Total,
                cardname:req.body.Cardname,
                amount_in_usd:req.body.amountInusd,
                status:'untreated',
                type:'Buy'
            })
            // console.log('Savetransaction',savetransaction);
            // console.log(req.body);
            if(savetransaction){
                req.body.Cart.forEach(d => {
                
                    giftcardtransactions.findOneAndUpdate({_id:savetransaction._id},{$push:{
                        rate:d
                   }},(err,docs)=>{
                       if(err){
                           res.send(err);
                           return false
                       }
                       
                       
                   })
                   
               }); 
                res.send({
                    "message":'GiftCard Buy Request Successfully Submitted',
                    "status":true
                 })
               
             }
             else{
                res.status(400).send('Internal Server Error')
             }
        }
    })


})


router.post('/filter/transactionlog',(req,res)=>{
   
    let startDate = req.body.startdate;
    let endDate = req.body.enddate;
    let type = req.body.type;
    let currency = req.body.asset;
    let status = req.body.status

    let momentstart = moment(startDate).startOf('day')
    let momentend = moment(endDate).endOf('day').toDate();
    

    let query = [];

    if(startDate && endDate ){
        query.push({
            updated: {
                // $gte: new Date(new Date(startDate)),
                // $lt: new Date(new Date(endDate).setHours(23, 59, 59))
                  $gte: momentstart,
                  $lt: momentend
            }
        })  

    }

    
    if(currency){
        query.push({
            currency:req.body.asset
        })
    }

    if(type){
        query.push({
            type:req.body.type
        })
    }
    if(status){
        query.push({
            status:req.body.status
        })
    }

    if(query.length > 0){
        
    const x = buy_n_sell.find({
        $and:query
      
       },(err,docs)=>{
           if(err){
               res.send(err)
           }
           else{
               res.send(docs)
           }
       }).sort({ updated: -1})

    }
    else{
        const x = buy_n_sell.find({},(err,docs)=>{
               if(err){
                   res.send(err)
               }
               else{
                   res.send(docs)
               }
        }).sort({ updated: -1})
    }
    
        
})

router.post('/getwithrawal/count',(req,res)=>{
    let currentdate = new Date();
// res.send(new Date(currentDate));
// return false;
const today = moment().startOf('day')
const endofday = moment(today).endOf('day').toDate();
console.log(today.toDate())
console.log(endofday)

    withdrawal.find({
        $and:[
            {
                userid:req.body._id
            },
            {
                updated: {$gte: today.toDate(),$lte: moment(today).endOf('day').toDate()}
            }
        ]
    },(err,docs)=>{
        if(err){
            res.status(400).send(err)
        }
        else{
            res.send(docs)
        }
       
    })
})

router.get('/sendmail',(req,res)=>{
    const mailData = {
        from: 'hello@jupitapp.co',  // sender address
        to: 'bigdevtemy@gmail.com',   // list of receivers
        subject: 'Email Verification',
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
                </style>
                
                
                
                <!--[if !mso]><!-->
                <link href="https://fonts.googleapis.com/css?family=Cabin:400,700" rel="stylesheet" type="text/css">
                <!--<![endif]-->
                
                </head>
                
                <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000">
                <!--[if IE]><div class="ie-container"><![endif]-->
                <!--[if mso]><div class="mso-container"><![endif]-->
                <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%" cellpadding="0" cellspacing="0">
                    <tbody>
                    <tr style="vertical-align: top">
                        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #f9f9f9;"><![endif]-->
                
                
                        <div class="u-row-container" style="padding: 0px;background-color: transparent">
                            <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->
                
                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                <div style="width: 100% !important;">
                                    <!--[if (!mso)&(!IE)]><!-->
                                    <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div style="color: #afb0c7; line-height: 170%; text-align: center; word-wrap: break-word;">
                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 14px; line-height: 23.8px;"></span></p>
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
                            <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
                
                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                <div style="width: 100% !important;">
                                    <!--[if (!mso)&(!IE)]><!-->
                                    <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                <td style="padding-right: 0px;padding-left: 0px;" align="center">
                
                                                    <img align="center" border="0" src="https://res.cloudinary.com/jupit/image/upload/v1656115771/Jupit_Logo_Wordmark_mkhimf.svg" alt="logo" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 32%;max-width: 179.2px;"
                                                    width="179.2" />
                
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
                            <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #003399;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->
                
                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                <div style="width: 100% !important;">
                                    <!--[if (!mso)&(!IE)]><!-->
                                    <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                <td style="padding-right: 0px;padding-left: 0px;" align="center">
                
                                                    <img align="center" border="0" src="https://cdn.templates.unlayer.com/assets/1597218650916-xxxxc.png" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 26%;max-width: 150.8px;"
                                                    width="150.8" />
                
                                                </td>
                                                </tr>
                                            </table>
                
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div style="color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                <p style="font-size: 14px; line-height: 140%;"><strong>T H A N K S&nbsp; &nbsp;F O R&nbsp; &nbsp;S I G N I N G&nbsp; &nbsp;U P !</strong></p>
                                            </div>
                
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:0px 10px 31px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div style="color: #e5eaf5; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 28px; line-height: 39.2px;"><strong><span style="line-height: 39.2px; font-size: 28px;">Verify Your E-mail Address </span></strong>
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
                            <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->
                
                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                <div style="width: 100% !important;">
                                    <!--[if (!mso)&(!IE)]><!-->
                                    <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div style="line-height: 160%; text-align: center; word-wrap: break-word;">
                                                <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 22px; line-height: 35.2px;">Hi, </span></p>
                                                <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 18px; line-height: 28.8px;">You're almost ready to get started. Please click on the button below to verify your email address and enjoy crypto exchange services! </span></p>
                                            </div>
                
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div align="center">
                                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Cabin',sans-serif;"><tr><td style="font-family:'Cabin',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://myjupit.herokuapp.com/users/jupit/emailverification/e9p5ikica6f19gdsmqta/qvrse/" style="height:46px; v-text-anchor:middle; width:235px;" arcsize="8.5%" stroke="f" fillcolor="#ff6600"><w:anchorlock/><center style="color:#FFFFFF;font-family:'Cabin',sans-serif;"><![endif]-->
                                                <a href="https://myjupit.herokuapp.com/users/jupit/emailverification/e9p5ikica6f19gdsmqta/qvrse/" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Cabin',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #ff6600; border-radius: 4px;-webkit-border-radius: 4px; -moz-border-radius: 4px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;">
                                                <span style="display:block;padding:14px 44px 13px;line-height:120%;"><span style="font-size: 16px; line-height: 19.2px;"><strong><span style="line-height: 19.2px; font-size: 16px;">VERIFY YOUR EMAIL</span></strong>
                                                </span>
                                                </span>
                                                </a>
                                                <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                            </div>
                
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:33px 55px 60px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div style="line-height: 160%; text-align: center; word-wrap: break-word;">
                                                <p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px;">Thanks,</span></p>
                                                <p style="line-height: 160%; font-size: 14px;"><span style="font-size: 18px; line-height: 28.8px;">The Support Team</span></p>
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
                            <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #e5eaf5;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #e5eaf5;"><![endif]-->
                
                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                <div style="width: 100% !important;">
                                    <!--[if (!mso)&(!IE)]><!-->
                                    <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:41px 55px 18px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div style="color: #003399; line-height: 160%; text-align: center; word-wrap: break-word;">
                                                <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 20px; line-height: 32px;"><strong>Get in touch</strong></span></p>
                                                <p style="font-size: 14px; line-height: 160%;">+2348088213177</p>
                                                <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px; color: #000000;"><a rel="noopener" href="mailto:support@jupitapp.co" target="_blank">support@jupitapp.co</a></span></p>
                                                <p style="font-size: 14px; line-height: 160%;"><span style="font-size: 16px; line-height: 25.6px; color: #000000;">https://www.jupitapp.co</span></p>
                                            </div>
                
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 10px 33px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div align="center">
                                                <div style="display: table; max-width:244px;">
                                                <!--[if (mso)|(IE)]><table width="244" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:244px;"><tr><![endif]-->
                
                
                                                <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                               
                                                <!--[if (mso)|(IE)]></td><![endif]-->
                
                                                <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                                
                                                <!--[if (mso)|(IE)]></td><![endif]-->
                
                                                <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                                <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 17px">
                                                    <tbody>
                                                    <tr style="vertical-align: top">
                                                        <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                        <a href="https://www.instagram.com/jupit.app/" title="Instagram" target="_blank">
                                                            <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png" alt="Instagram" title="Instagram" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
                                                        </a>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                                <!--[if (mso)|(IE)]></td><![endif]-->
                
                                                <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 17px;" valign="top"><![endif]-->
                                               
                                                <!--[if (mso)|(IE)]></td><![endif]-->
                
                                                <!--[if (mso)|(IE)]><td width="32" style="width:32px; padding-right: 0px;" valign="top"><![endif]-->
                                                <table align="left" border="0" cellspacing="0" cellpadding="0" width="32" height="32" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;margin-right: 0px">
                                                    <tbody>
                                                    <tr style="vertical-align: top">
                                                        <td align="left" valign="middle" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                                                        <a href="mailto:support@jupitapp.co" title="Email" target="_blank">
                                                            <img src="https://cdn.tools.unlayer.com/social/icons/circle-black/email.png" alt="Email" title="Email" width="32" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: none;height: auto;float: none;max-width: 32px !important">
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
                            <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #003399;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #003399;"><![endif]-->
                
                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                <div style="width: 100% !important;">
                                    <!--[if (!mso)&(!IE)]><!-->
                                    <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                    <!--<![endif]-->
                
                                    <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                        <tbody>
                                        <tr>
                                            <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">
                
                                            <div style="color: #fafafa; line-height: 180%; text-align: center; word-wrap: break-word;">
                                                <p style="font-size: 14px; line-height: 180%;"><span style="font-size: 16px; line-height: 28.8px;">Copyrights &copy; jupitapp</span></p>
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
            // console.log(err);
            res.send({"message":"An Error Occurred","callback":err})
        }
        
        else{

            res.send({"message":"The password reset link has been sent to your mail","callback":info,"status":true})
            
        }
    })
    
})

router.get('/test/zeptomail',(req,res)=>{
    

    const url = "api.zeptomail.com/";
    const token = "Zoho-enczapikey wSsVR60n+xTxDv8rnz2qI+85n1sBBAj0FRh731Sp6Hb+Gv3Bocc/lE2cAAClHfEYQGFpFjYSpLkhyk9UhGBbjNh7nFoJDyiF9mqRe1U4J3x17qnvhDzKXWlckxOKJIgPxgtrmmRlFsok+g==";
    
    let client = new SendMailClient({url, token});
    
    client.sendMail({
        "bounce_address": "bounce_record@bounce.jupitapp.co",
        "from": 
        {
            "address": "noreply@jupitapp.co",
            "name": "noreply"
        },
        "to": 
        [
            {
            "email_address": 
                {
                    "address": "bigdevtemy@gmail.com",
                    "name": "Jupit"
                }
            }
        ],
        "subject": "Test Email",
        "htmlbody": "<div><b> Test email sent successfully.</b></div>",
    }).then((resp) => {res.send("Mail Sent")})
    .catch((error) => {res.send(error)});
})

router.post('/update/backup',async(req,res)=>{
    Usermodel.findOne({'btc_wallet.0.address':req.body.address},async(err,docs)=>{
        if(err){
            res.send(err);
        }
        else if(docs){
            res.send('Wallet Already In Use')
        }
        else if(!docs){
            let x =   await Usermodel.findOneAndUpdate({email:req.body.email},{$set:{'btc_wallet.0.address':req.body.address}}).exec();
            let y=   await Usermodel.findOneAndUpdate({email:req.body.email},{$set:{'backup':req.body.address}}).exec();
            if(x){
                res.send('Updated')
            }
            else{
                res.send('Failed')
            }
        }
    })
    


})

router.post('/withdrawal/count',(req,res)=>{
    let today = 
    withdrawal.find({userid:req.body._id},(err,docs)=>{
        if(err){
            res.status(400).send(err);
        }
        else{
            res.send(docs)
        }
    })
})



export default router