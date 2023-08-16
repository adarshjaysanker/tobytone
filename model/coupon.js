const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({

    offer : {
        type  :String,
        required : true,
    },

    code : {
        type : String,
        required : true,
        unique : true
    },

    discount : {
        type : String,
        required : true,
    },

    expirationDate : {
        type : Date,
        required : true,
    },

    isActive : {
        type : Boolean,
        required : true,
    },

    createdAt : {
        type : Date,
        default : Date.now(),
    },
    amountType : {
        type : String,
        enum : ['amount', 'percentage'],
        required : true,
    },
});

const Coupon = mongoose.model('Coupon',couponSchema);
module.exports = Coupon;