import mongoose from 'mongoose';


const notification = mongoose.Schema({
    type:{
        type:'String',
       
    },
    from_address:{
        type:'String',
    
    }, 
    amount:{
        type:'String'
    },
    status:{
        type:'String'
    },
    read_sender:{
        type:'String'
    },
    read_receipent:{
        type:'String'
    },
    updated: { type: Date, default: Date.now() },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('notifications', notification);