import mongoose from 'mongoose';


const twofactor = mongoose.Schema({
    userid:{
        type:'String',
       
    },
    ascii:{
        type:'String'
    },
    hex:{
        type:'String',
    },
    base32:{
        type:'String'  
    },
    otpauth_url:{
        type:'String',
    }, 
    updated: { type: Date, default: Date.now() },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('twofactor', twofactor);