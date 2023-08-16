const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

    selected : {
        type : Boolean,
        default : false,
    },

    name : {
        type : String,
    },

    address : {
        type :String,
    },

    email :{
        type : String
    },

    phonenumber : {
        type : String
    },

    pincode : {
        type : String,
    },

    locality : {
        type : String,
    },

    city : {
        type : String,
    },

    district : {
        type : String,
    },

    state : {
        type : String,
    },

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required : true
    }
});

const address = mongoose.model('address',addressSchema);
module.exports = address;

