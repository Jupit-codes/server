import mongoose from 'mongoose'

const webhookSchema = mongoose.Schema({
    event:{
        type:'String',
    },
    customerid:{
        type:'String',
    },
    customercode:{
        type:'String',
    },
    email:{
        type:'String',
    },
    bvn:{
        type:'String',
    },
    account_number:{
        type:'String',
    },
    bankcode:{
        type:'String',
    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('webhook', webhookSchema);