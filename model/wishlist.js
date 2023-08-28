const mongoose = require("mongoose");
const wishlistSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true,
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "products",
        required : true,
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },
});

const Wishlist = mongoose.model("Wishlist",wishlistSchema);
module.exports = Wishlist;