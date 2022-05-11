import mongoose from 'mongoose'

const giftcardSchema = mongoose.Schema({
    cardname:{
        type:'String',
        unique:true,
        required: [true, "Required"],
    },
    currency:[{currencyType:String}],
    cardtype:[{cardTypeDocs:String}],
    date_created:{
        type:Date

    },
    
    updated: { type: Date, default: Date.now },
})


export default mongoose.model('Giftcard', giftcardSchema);