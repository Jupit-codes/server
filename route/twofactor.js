import express from "express";
const router = express.Router();

router.get('/',(req,res)=>{
    console.log('Welcome')
    // console.log(path.basename(path.resolve(`${'./aws.json'}`)));
    res.send('Welcome to @FA');
});





export default router;