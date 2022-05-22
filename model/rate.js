import mongoose from 'mongoose'

const RateSchema = mongoose.Schema({
    initialization:{
        type:String
    },
    btc : {type:Array,"default":[]},
    usdt : {type:Array,"default":[]},
    giftcard : {type:Array,"default":[]},
    date_created:{
        type:Date
    },
    
    updated: { type: Date, default: Date.now },
})


export default mongoose.model('Rate', RateSchema);