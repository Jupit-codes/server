import mongoose from 'mongoose'

const giftcardimageSchema = mongoose.Schema({
    userid:{
        type:'String',
        required: [true, "Required"],
    },
    unique_id:{
        type:'String',
        
    },
    image_url:{
        type:'String',
        
    },
    
    status:{
        type:'String'
    },
    updated: { type: Date, default: Date.now },
})

export default mongoose.model('giftcardimage', giftcardimageSchema);