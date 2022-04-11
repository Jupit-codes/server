import mongoose from 'mongoose'

const SetUpPin = mongoose.Schema({
    userid:{
        type:'String',
        required: [true, "Required"],
    },
    code:{
        type:'String',
        required: [true, "Required"],
        
    },
    updated: { type: Date, default: Date.now() },
})


export default mongoose.model('SetUpPin', SetUpPin);