import mongoose from 'mongoose'

const kycSchema = mongoose.Schema({
    userid:{
        type:'String',
        required: [true, "Required"]
    },

    level1:[{email:"String",status:'String'}],
    level2:[
                {
                    email:'String',
                    customer_code:'String',
                    integration:'String',
                    event_status:'String',
                    status:'String'
                }
            ],
    level3:[{utilitybill:'String',callbackStatus:'String',status:'String'}],
    level4:[{idcard_type:'String',uniqueNumber:'Number', callbackStatus:'String',status:'String'}],
    updated: { type: Date, default: Date.now() },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('Kyc', kycSchema);