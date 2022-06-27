import mongoose from 'mongoose'

const giftcardtransactionSchema = mongoose.Schema({
    cardname:{
        type:'String',
        
    },
    email:{
        type:'String'
    },
    userid:{
        type:'String',
        
    },
    country:{type:'String'},
    unique_id:{type:'String'},
    rate : {type:Array,"default":[]},
    total:{type:Number},
    type:{
        type:'String'
    },
    amount_in_usd:{type:Number},
    date_created:{
        type:Date
    },
    status:{type:'String'},
    updated: { type: Date, default: Date.now },
})


export default mongoose.model('Giftcardtransactions', giftcardtransactionSchema);