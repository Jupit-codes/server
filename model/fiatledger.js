import mongoose from 'mongoose'

const fiatschema = mongoose.Schema({
    userid:{
        type:'String'
        
    },
    email:{
        type:'String'
        
    },
    amount:{
        type:'String'
        
        
    },
    transaction_fee:{
        type:'String'
        
        
    },
    type:{
        type:'String'
    },
    diff_type:{
        type:'String'
    },
    dateofcreation:{
        type:Date
    },
    status:{
        type:'String'
    },
    updated: { type: Date, default: Date.now }
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('fiatledger', fiatschema);