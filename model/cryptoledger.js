import mongoose from 'mongoose'

const cryptoSchema = mongoose.Schema({
    userid:{
        type:'String',
       
    },
    address:{
        type:'String',
      
    },
    amount:{
        type:'String',
       
        
    },
    type:{
        type:'String',
       
        
    },
    
    currency:{
        type:'String',
        
        
    },
    transaction_fee:{
        type:'String',
        
    },
    status:{
        type:'String'
    },
    dateofcreation:{
        type:Date
    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('cryptoledger', cryptoSchema);