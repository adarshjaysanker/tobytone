const mongoose=require('mongoose');
const bcrypt = require('bcrypt');
const address = require('./address')
const {isEmail,isAlphanumeric}=require('validator')
const passwordValidator=function(password){
    if(!password){
        return false
    }
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    return regex.test(password)
}


const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter a name'],
       
    },
    email:{
        type:String,
        unique:true,
        required:[true, 'please enter an email '],
        lowercase:true,
        validate:[isEmail,'Please enter a valid email']
    },
    PhoneNumber:{
   type:Number,
   
   
    },
    password:{
        type:String,
        required: [true, 'Please enter a password '],
        minlength:[8,'minimum length is 8 character'],
        validate:{
            validator:function(value){
                return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(value)
            },
            message: 'Password should contain at least one uppercase letter, one lowercase letter, and one number, and must be at least 8 characters long',
        }
    },
    confirm_password:{
        type:String,
        
    },
    verificationStatus:{
        type:Boolean,
        default:false
    }
    ,
   gender:{
    type:String,
    enum:['male','female']
   },
    isActive:{
        type: Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },

    addresses : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'address'
        }
    ],

    usedCoupons : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Coupon'
        }
    ],

    

    cart : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'cart'
        }
    ]

    
},{
    timestamps:true
})

userSchema.pre('save',async function (next){
    const salt=await bcrypt.genSalt()
    this.password=await bcrypt.hash(this.password,salt)
    next()
})
//static method to user login
userSchema.statics.login= async function(email,password){
    const user =await this.findOne({email})
if (user){
    if(user.isActive && user.verificationStatus){

      const auth=await  bcrypt.compare(password,user.password)
      if(auth){
        return user
      }
      throw Error('incorrect password')

    }else if(!user.isActive){
        throw Error('Blocked')
    }
    
}
    

    throw Error('incorrect email')
}
const users=mongoose.model('users', userSchema)
module.exports=users