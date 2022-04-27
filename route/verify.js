

import express from "express";
import Usermodel from '../model/users.js';
import KycModel from '../model/kyc.js';
import wallet_transactions from "../model/wallet_transactions.js";
import Kyc from '../model/kyc.js'
import IdCardVerification from '../model/idcardverification.js'

import axios from "axios";
import cloudinary from 'cloudinary'
import notification from "../model/notification.js";
import webhook from "../model/webhook.js";
cloudinary.config({ 
    cloud_name: 'jupit', 
    api_key: '848134193962787', 
    api_secret: '57S453gwuBc1_vypuLOcqYQ2V5o' 
  });

const router = express.Router();

router.get('/me',(req,res)=>{
    console.log('Welcome to Verify me');
    
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


router.get('/date/aggregate',async (req,res)=>{
    let dateToken = await wallet_transactions.aggregate([
        { $match: { currency: 'BTC',order_id:'6265c9d156dbc6a0fe361daa' } },
        { $group : { 
            _id : { year: { $year : "$updated" }, month: { $month : "$updated" },day: { $dayOfMonth : "$updated" }}, 
            count : { $sum : 1 },
            amount: { $sum : "$amount"},
            transaction_type:{$sum:"$type"}
            
        },
            
            
            }, 
       { $group : { 
            _id : { year: "$_id.year", month: "$_id.month" }, 
            dailyusage: { $push: { day: "$_id.day", count: "$count",totalTransaction:"$amount",type:"$transaction_type"  }}}
            }, 
       { $group : { 
            _id : { year: "$_id.year" }, 
            monthlyusage: { $push: { month: "$_id.month", dailyusage: "$dailyusage" }}}
            }
    ])

     res.json(dateToken);
      console.log(dateToken);
         
        
  
})

router.get('/emptyTable',(req,res)=>{
    webhook.deleteMany({},(err,docs)=>{
        if(err){
            res.json(err)
        }
        if(docs){
            res.json('Deleted')
        }
    })
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
      console.log(docs);
})

export default router