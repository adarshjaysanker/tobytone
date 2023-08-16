const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title : {
        type : String,
    },
    image : {
        type : String,
    },
    createdAt : {
        type : Date,
        default : Date.now,
    },
});

const Banner = mongoose.model('Banner',bannerSchema);
module.exports = Banner;