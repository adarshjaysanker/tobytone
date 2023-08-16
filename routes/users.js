const express=require('express');
const router=express.Router();
const {body,validationResult }=require('express-validator');
const { postSignUp, postSignupOtpNumber, postOtpPage, postLogin, getHomePage, getAllProducts , getProductDetails , getUserhome , getAddress , getAddAddress , postAddAddress , getCart , addToCart , changeProductQuantity , removeFromCart, getCheckOut , updateUserStatus , getOrders, postPlaceOrder , getOrderProducts , removeFromWishlist , addToWishlist ,orderCreation , filterProducts , sortProducts , searchProducts , applyCoupon , checkCoupon, getInvoice, updateAddress , selectAddress , deleteAddress} = require('../controllers/user/userController');
const users = require('../model/users')
const {checkUser,requireAuth}=require('../middlewares/user-middleware');
const { verify } = require('jsonwebtoken');

router.get('/',checkUser,getHomePage)
router.get('/signup',(req,res)=>{
  res.render('user/signup',{layout:false});
});

router.post('/signup',postSignUp)
router.get('/signup-otp-verify',(req,res)=>{
  res.render('user/verifyotp',{layout:false})
})
router.post('/verify-signup-otp',postSignupOtpNumber)
// router.get('/signup-otp-verify',(req,res)=>{
//   res.render('user/verifyotp',{layout:false});
// })


router.post('/admin/statusupdate',checkUser,updateUserStatus);





;

router.get('/dashboard',(req,res)=>{
  if(req.session.isAdminAuthenticated){
    return res.render('user/index');
  }else{
    return res.redirect('/user/login');
  }
});

router.get('/allproducts',checkUser,getAllProducts)

router.get('/login',(req,res)=>{
  res.render('user/login',{layout:false})
})
router.post('/login',postLogin);

router.get('/logout',(req,res)=>{
  res.cookie('jwt',{maxAge:1})
  res.redirect("/")

  })

  router.get('/productdetails/:id',checkUser,getProductDetails);

router.get('/userhome/:id',checkUser,getUserhome);

router.get('/manageaddress',checkUser,getAddress);

router.get('/addaddress',checkUser,getAddAddress);

router.post('/addaddress',checkUser,postAddAddress);

router.get('/getcart',checkUser,getCart);

router.get('/addtocart/:id',checkUser,addToCart);

router.get('/change',checkUser,changeProductQuantity)

router.get('/removefromcart/:id',checkUser,removeFromCart);

router.get('/checkout',checkUser,getCheckOut);

router.get('/orderproducts', checkUser, getOrderProducts);
 
router.get('/getorders',checkUser,getOrders);

router.post('/place-order',checkUser,postPlaceOrder);

// Handle the Razorpay webhook
router.post('/create/orderId',orderCreation);

router.get('/filterproducts',filterProducts);

router.get('/sortproducts/:category',sortProducts);

router.get('/searchproducts',searchProducts);

router.get('/applycoupon/:couponCode', checkUser,applyCoupon);

router.get('/checkcoupon',checkCoupon);

router.get('/getinvoice/:orderid',checkUser,getInvoice);

router.post('/updateaddress',checkUser,updateAddress);

router.post('/selectaddress/:addressId',checkUser,selectAddress);

router.delete('/deleteaddress/:addressId',checkUser,deleteAddress);
























  






module.exports=router;