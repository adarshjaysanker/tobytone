const mongoose = require('mongoose');
const users=require('../model/users')
const accountSid = "ACd749a673a5f166e015fcd2b917b8931b";
// const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAfb099cfe7b8f0091645a65e310304d1c";
const client = require("twilio")(accountSid, process.env.TWILIO_AUTH_TOKEN);
const orders= require('../model/orders');


module.exports={
    adduser:(userDetails)=>{
        console.log(userDetails,'{{{');
        return new Promise( async (resolve,reject)=>{
            const user=new users({
                name:userDetails.name,
                age:userDetails.age,
                email:userDetails.email,
                mobilenumber:userDetails.mobilenumber,
            })
             user.save();
             resolve()
        })
    },
    addUser: (userInput)=>{
        return new Promise( (resolve, reject) => {
          const user =  new  users({
           name:userInput.name,      email:userInput.email,
            PhoneNumber:userInput.mobile,
             password:userInput.password,
             confirm_password:userInput.confirmpassword
             
           })
           user.save()
             .then(() => {
              resolve(user)
            })
            .catch((err) => {
               reject(err)
              })
         })
       },
       doOtpSignUp:(number)=>{
        return new Promise( (resolve, reject) => {
          if(number){
            const num=`+91${number}`
            console.log(num);
              client.verify.v2.services(verifySid)
              .verifications
              .create({to: num, channel: 'sms'})
              .then(verification => console.log(verification.status))
             
                
                resolve()
            }else{
                reject()
    
            }
          

        })
       },
       signUpNumberVerification:(otp,number)=>{
        return new Promise((resolve,reject)=>{
          client.verify.v2.services(verifySid)
          .verificationChecks
          .create({to:`+91${number}` , code: otp})
          .then((response) => {
            console.log("PPPPPPPPPPP");
            console.log(response);

            if(response.valid){
              users.findOneAndUpdate({PhoneNumber:number},{ verificationStatus: true }, { new: true }).then(user=>{

              
              console.log(user,'*****')
                resolve(user)   
            }).catch(()=>{
            reject()
          })
            }
            else{
              reject()

            }
            
    
      })
    })
    },
    
   
    userOrder:(userid)=>{
      return new Promise(async(resolve,reject)=>{
        const userOrder= await orders.aggregate([
          {
            '$match': {
              'user': new mongoose.Types.ObjectId(userid)
            }
          }, {
            '$unwind': {
              'path': '$products'
            }
          }, {
            '$unwind': {
              'path': '$products.productId'
            }
          }, {
            '$lookup': {
              'from': 'products', 
              'localField': 'products.productId', 
              'foreignField': '_id', 
              'as': 'orderedProducts'
            }
          }
        ])
        resolve(userOrder)
      console.log(userOrder);
      console.log("huuhiiiiiigi");
      })
      
    },

     updateQuantity(productId, quantity) {
      return new Promise((resolve, reject) => {
        Cart.findOneAndUpdate(
          { 'products.productId': productId },
          { $set: { 'products.$.quantity': parseInt(quantity) } },
          { new: true }
        )
          .populate('products.productId')
          .exec((err, cart) => {
            if (err) {
              reject(err);
            } else {
              resolve(cart);
            }
          });
      });
    }
   

    
}