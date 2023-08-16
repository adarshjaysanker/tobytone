const mongoose = require('mongoose');
const wishlistSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required : true
    },
    products : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'products'
        }
    ]
});

const wishlist = mongoose.model('wishlist',wishlistSchema);
module.exports = wishlist;