const mongoose=require('mongoose');

const productschema=new mongoose.Schema({

    title:{
        type:String,
    },

    description:{
        type:String
    },

    cost:{
        type:Number
    },

    mycategory:{
        type:String,
        enum:['True wireless airpodes','Wireless earphones','wireless headphones','Wireless speakers','Wired Earphones','Soundbars','Home Audio','Party speakers','Gaming headphones','others'],

    },

    image:{
        type:Array
    },
});

const products=mongoose.model('products',productschema);
module.exports=products;

