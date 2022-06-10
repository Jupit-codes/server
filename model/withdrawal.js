import mongoose from 'mongoose'

const withdrawalSchema = mongoose.Schema({
    userid:{
        type:'String',
        required: [true, "Required"],
    },
    amount:{
        type:'String',
        required: [true, "Required"],
        
    },
    email:{
        type:'String',

    },
    type:{
        type:'String',
        required: [true, "Required"],
        
    },
    
    currency_worth:{
        type:'String',
        required: [true, "Required"],
    },
    dateofcreation:{
        type:Date
    },
    updated: { type: Date, default: Date.now },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('Withdrawal', withdrawalSchema);