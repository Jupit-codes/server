import mongoose from 'mongoose'

const changepasswordSchema = mongoose.Schema({
    unique_code:{
        type:'String',
        required: [true, "Required"],
    },
    userid:{
        type:'String',
        
    },
    status:{
        type:'String',
        
    },
    date_created:{
        type:Date

    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('ChangePassword', changepasswordSchema);