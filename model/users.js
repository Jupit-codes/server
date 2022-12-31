import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    username:{
        type:'String',
        unique:true,
        required: [true, "Required"],
    },
    firstname:{
        type:'String',
        trim : true,
        required: [true, "Required"],
    },
    lastname:{
        type:'String',
        trim : true,
        required: [true, "Required"],
    },
    virtual_account:{
        type:'String',
    },
    email:{
        type:'String',
        required: [true, "Required"],
        unique:true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    phonenumber:{
        type:'String',
        required: [true, "Required"],
        unique:true,
    },
    password:{
        type:'String',
        required: [true, "Required"],
    },
    naira_wallet:[{balance:{type:mongoose.Decimal128},address:'String'}],
    btc_wallet:[{balance:{type:mongoose.Decimal128},address:{type:'String',immutable: true}}],
    usdt_wallet:[{balance:{type:mongoose.Decimal128},address:{type:'String',immutable: true}}],
    wallet_pin:{
        type:'String'
    },
    email_verification:{
        type:'Boolean',
        required:[true,"Required"]
    },
    TWOFA:{
        type:'Boolean',
        default:false
    },
    Pin_Created:{
        type:'Boolean',
        default:false
    },
    Status:{
        type:'String',
        default:'Active'
    },
    suspension:{
        type:Boolean,
        default:false
    },
    blacklist:{
        type:Boolean,
        default:false
    },
    loginTime:{
        type:'String'
    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('User', userSchema);