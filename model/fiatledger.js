import mongoose from 'mongoose'

const fiatschema = mongoose.Schema({
    userid:{
        type:'String',
        required: [true, "Required"],
    },
    email:{
        type:'String',
        required: [true, "Required"],
    },
    amount:{
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
export default mongoose.model('fiatledger', fiatschema);