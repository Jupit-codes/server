import mongoose from 'mongoose';
import Double from '@mongoosejs/double';

const wallet_transactions = mongoose.Schema({
    type:{
        type:'String',
       
    },
    serial:{
        type:'String',
    
    },
    order_id:{
        type:'String',
       
    },
    currency:{
        type:'String',
        
    },
    txtid:{
        type:'String',
        
    },
    usdvalue:{
        type:'String'
    },
    nairavalue:{
        type:Double
    },
    rateInnaira:{
        type:'String'
    },
    marketprice:{
        type:'String'
    },
    amount:{
        type:Double
    },
    fees:{
        type:Double
    },
    from_address:{
        type:'String'
    },
    to_address:{
        type:'String'
    },
    wallet_id:{
        type:'String'
    },
    state:{
        type:'String'
    },
    confirm_blocks:{
        type:'String'
    },
    processing_state:{
        type:'String'
    },
    status:{
        type:'String'
    },
    read:{
        type:'String'
    },
    date_created:{
        type:Date

    },
    case:{
        type:'String'
    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('wallet_transactions', wallet_transactions);