import mongoose from 'mongoose';


const notification = mongoose.Schema({
    type:{
        type:'String',
       
    },
    asset:{
        type:'String'  
    },
    from_address:{
        type:'String',
    
    }, 
    to_address:{
        type:'String',
    
    }, 
    amount:{
        type:'String'
    },
    userid:{
        type:'String'
    },
    status:{
        type:'String'
    },
    read:{
        type:'String'
    },
    updated: { type: Date, default: Date.now() },
})

// const User = mongoose.model('User',userSchema);
// module.exports = User;

// module.exports = mongoose.model('User',userSchema)
export default mongoose.model('notifications', notification);