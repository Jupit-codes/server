import mongoose from 'mongoose'

const giftcardSchema = mongoose.Schema({
    brandname:{
        type:'String',
        unique:true,
        required: [true, "Required"],
    },
    image_url:{type:'String'},
    countries : {type:Array, default:[]},
    rate : {type:Array,default:[]},
    date_created:{
        type:Date

    },
    
    updated: { type: Date, default: Date.now },
})


export default mongoose.model('Giftcard', giftcardSchema);