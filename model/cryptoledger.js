import mongoose from 'mongoose'

const cryptoSchema = mongoose.Schema({
    userid:{
        type:'String',
        required: [true, "Required"],
    },
    address:{
        type:'String',
        required: [true, "Required"],
    },
    amount:{
        type:'String',
        required: [true, "Required"],
        
    },
    type:{
        type:'String',
        required: [true, "Required"],
        
    },
    
    currency:{
        type:'String',
        required: [true, "Required"],
        
    },
    transaction_fee:{
        type:'String',
        required: [true, "Required"],
    },
    dateofcreation:{
        type:Date
    },
    status:{
        type:'String'
    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('cryptoledger', cryptoSchema);