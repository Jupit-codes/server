import mongoose from 'mongoose'

const idcardverification = mongoose.Schema({
    cardtype:{
        type:'String',
    },
    cardnumber:{
        type:'String',
    },
    imagepath:{
        type:'String',
    },
    userid:{
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
export default mongoose.model('idcardverification', idcardverification);