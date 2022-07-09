import mongoose from 'mongoose'

const adminRolesSchema = mongoose.Schema({
    rolename:{
        type:'String',
        required: [true, "Required"],
    },
    status:{
        type:'String'
    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('adminrole', adminRolesSchema);