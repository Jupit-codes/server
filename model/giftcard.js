import mongoose from 'mongoose'

const giftcardSchema = mongoose.Schema({
    cardname:{
        type:'String',
        unique:true,
        required: [true, "Required"],
    },
    currency:[{type:'String'}],
    cardtype:[{type:'String'}],
    date_created:{
        type:Date

    },
    
    updated: { type: Date, default: Date.now },
})


export default mongoose.model('Giftcard', giftcardSchema);