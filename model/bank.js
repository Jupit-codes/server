import mongoose from 'mongoose'

const bankSchema = mongoose.Schema({
    email:{
        type:'String',
        required: [true, "Required"],
    },
    bank_code:{
        type:'String',
        
    },
    account_number:{
        type:'String',
        required: [true, "Required"],
    },
    account_name:{
        type:'String',
        required: [true, "Required"],
    },
    bvn:{
        type:'String',
        required: [true, "Required"],
    },
    updated: { type: Date, default: Date.now() },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('Bank', bankSchema);