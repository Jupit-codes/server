import mongoose from 'mongoose'

const loggerSchema = mongoose.Schema({
    userid:{
        type:'String',   
    },
    username:{
        type:'String',
 
    },
    roleid:{
        type:'String', 
    },
    
    status:{
        type:'String'
    },
    time:{
        type:Date
    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('Logger', loggerSchema);