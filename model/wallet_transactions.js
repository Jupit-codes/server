import mongoose from 'mongoose';


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
    amount:{
        type:'String'
    },
    fees:{
        type:'String'
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

    updated: { type: Date, default: Date.now() },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('wallet_transactions', wallet_transactions);