import mongoose from 'mongoose'

const deposit_webhookSchema = mongoose.Schema({
    reference:{
        type:'String',
        required: [true, "Required"],
    },
    account_number:{
        type:'String',
        
    },
    amount:{
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
export default mongoose.model('deposit_webhook', deposit_webhookSchema);