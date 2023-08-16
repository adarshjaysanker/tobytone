const mongoose=require('mongoose');

const categoryschema=new mongoose.Schema({

    title:{
        type:String,
    },
    
    description:{
        type:String
    },

    image:{
        type:Array
    },
});

const categories=mongoose.model('categories',categoryschema);
module.exports=categories;

