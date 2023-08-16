const mongoose = require('mongoose');
const { Number } = require('twilio/lib/twiml/VoiceResponse');
const orderSchema = new mongoose.Schema({
  user : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'users',
    
  },

  orderId : {
    type : String,
  },

  customerName : { 
    type : String,
  },

  email : {
    type : String,
  },

  address : {
    type : String,
  },

  pincode : {
    type : String,
  },

  contactNumber : {
    type : String,
  },

  orderDate : {
    type : Date,
  },

  products : [
    {
      productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'products',
      },
      quantity : {
        type : Number,
        default : 1
      },
    },
  ],

  status : {
    type : String,
    enum : ['Placed', 'Delivered'],
    default : 'Pending',
  },

  paymentMethod : {
    type : String,
  },

  amount:Number

  
});

const orders = mongoose.model('orders',orderSchema);
module.exports = orders;