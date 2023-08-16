const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required : true,
    },
    products : [
        {
        productId: {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'products',
            required:true,
        },
        quantity:{
            type:Number,
            default : 1,
        },

        itemTotal : {
            type : Number,
        },
       
        totalamount : {
            type : Number
        },
    }
  ],
});

const cart = mongoose.model('cart',cartSchema);
module.exports = cart;