import mongoose from 'mongoose'

const sessionSchema = mongoose.Schema({
    email:{
        type:'String',
        required: [true, "Required"],
    },
    code:{
        type:'String',
        
    },
    userid:{
        type:'String',
        required: [true, "Required"],
    },
    status:{
        type:'String',
        required: [true, "Required"],
    },
    date_created:{
        type:Date

    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('Session',sessionSchema);