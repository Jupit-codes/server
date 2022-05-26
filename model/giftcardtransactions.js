import mongoose from 'mongoose'

const giftcardtransactionSchema = mongoose.Schema({
    cardname:{
        type:'String',
        
    },
    userid:{
        type:'String',
        
    },
    country:{type:'String'},
    unique_id:{type:'String'},
    rate : {type:Array,"default":[]},
    total:{type:Number},
    date_created:{
        type:Date
    },
    
    updated: { type: Date, default: Date.now },
})


export default mongoose.model('Giftcardtransactions', giftcardtransactionSchema);