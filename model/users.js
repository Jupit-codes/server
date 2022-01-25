import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    username:{
        type:'String'
    },
    email:{
        type:'String',
        required: [true, "Required"],
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    phonenumber:{
        type:'String',
        required: [true, "Required"],
    },
    password:{
        type:'String',
        required: [true, "Required"],
    },
    naira_wallet:[{balance:{type:'Number',set: function (v) { return Math.round(v);}},address:'String'}],
    btc_wallet:[{balance:{type:'Number',set: function (v) { return Math.round(v);}},address:'String'}],
    usdt_wallet:[{balance:{type:'Number',set: function (v) { return Math.round(v);}},address:'String'}],
    email_verification:{
        type:'Boolean',
        required:[true,"Required"]
    },
    updated: { type: Date, default: Date.now() },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('User', userSchema);