var express = require("express");
var router = express.Router();
var users = require("../../model/users");
const products = require("../../model/products");
const carts = require("../../model/cart");
const orders = require("../../model/orders");
const Banner = require("../../model/banner");
const wishlists = require("../../model/wishlist");
const { checkUser, requireAuth } = require("../../middlewares/user-middleware");
const Razorpay = require("razorpay");
const Coupon = require("../../model/coupon");
var instance = new Razorpay({
  key_id: "rzp_test_KdbN9LDcadJzNj",
  key_secret: "rzp_test_KdbN9LDcadJzNj",
});
// const orders = require('../../model/order');

//var nodemailer=require('nodemailer');
const jwt = require("jsonwebtoken");
const {
  doOtpSignUp,
  signUpNumberVerification,
  addUser,
  placeOrder,
  userOrder,
} = require("../../helpers/user-helper");
const { displayProducts, userlist } = require("../admin/productController");
const {
  displayHomeProduct,
  displayCategory,
} = require("../../helpers/product-helpers");

const handleErrors = (err) => {
  console.log("JJJHIOHIHIOH");
  console.log(err);
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };
  if (err.message === "incorrect email") {
    errors.email = "This email is not registerd ";
  }
  if (err.message === "incorrect password") {
    errors.password = "The password is incorrect";
  }
  if (err.message === "Blocked") {
    errors.block =
      "Sorry, you are currently blocked and cannot access this site.";
  }
  //duplicate error code
  if (err.code === 11000) {
    errors.email = "the email is already registered";
    return errors;
  }
  //validation errors
  if (err.message.includes("users validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  console.log(errors, ">>>>>>>>>>>>>>>>>>>>");
  return errors;
};
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secret of my application", {
    expiresIn: maxAge,
  });
};

const addr = require("../../model/address");
const Orders = require("../../model/orders");
const address = require("../../model/address");
/* const { valueOrDefault } = require("chart.js/dist/helpers/helpers.core"); */

module.exports = {
  generateotp: () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
  },

  sendotptoemail: (email, otp) => {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "adarshjayasanker5@gmail.com",
        pass: "adarshjeena",
      },
    });

    const mailoptions = {
      from: "adarshjayasanker5@gmail.com",
      to: email,
      subject: "OTP VERIFICATION",
      text: "your code is: ${otp}" + otp,
    };

    transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        console.error("error sending otp", error);
      } else {
        console.log("OTP send successfully", info.response);
      }
    });
  },
  postSignUp: async (req, res) => {
    try {
      const user = await addUser(req.body);
      //  const token = createToken(user._id)
      //  res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
      req.session.signUpMobile = user.PhoneNumber;
      doOtpSignUp(user.PhoneNumber).then((response) => {
        res.status(201).json({ users: user._id });
      });
    } catch (err) {
      console.log();
      const errors = handleErrors(err);
      console.log(errors, "+++++++++++++++++++++++++++++");
      res.status(400).json({ errors });
    }
  },
  postSignupOtpNumber: (req, res) => {
    const otpNumber = req.body.otpNumber;
    const number = req.session.signUpMobile;
    signUpNumberVerification(otpNumber, number)
      .then((user) => {
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
        req.session.user = token;
        console.log(req.session.token);
        res.status(200).json({ user: user._id });
      })
      .catch((err) => {
        const invalid = "Enter the correct otp";
        console.log(err);
        res.status(400).json({ invalid });
      });
  },
  postOtpPage: (req, res) => {
    res.render("user/verifyotp", { layout: false });
  },
  postLogin: async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    try {
      const user = await users.login(email, password);
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      req.session.user = token;
      req.session.userdetails = user;
      console.log(req.session.token);
      res.status(200).json({ user: user });
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  },
  getHomePage: async (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    const products = await displayHomeProduct();
    const categories = await displayCategory();
    const banners = await Banner.find().exec();

    res.render("user/index", {
      products: products,
      categories: categories,
      layout: false,
      isLoggedIn,
      banners: banners,
    });
  },

  updateUserStatus: async (req, res) => {
    const userId = res.locals.user._id.toString();

    try {
      const user = await users.findById(userId);
      if (!user) {
        console.log("user is not found");
      }

      user.isActive = !user.isActive;

      await user.save();

      if (req.session.token) {
        const decodeId = await verifyToken(req.session.token);

        if (!user.isActive && decodeId === user._id.toString()) {
          req.session.token = null;
        }
      }

      res.status(200).json({ active: user.isActive });
    } catch (error) {
      console.error(error);
    }
  },

  getAllProducts: async (req, res) => {
    const isLoggedIn = req.session.user ? true : false;
    const products = await displayHomeProduct();
    const userId = res.locals.user._id.toString();

    const wishlist = await wishlists.findOne({ user: userId });

    res.render("user/allproducts", {
      products: products,
      layout: false,
      isLoggedIn,
      wishlist: wishlist,
    });
  },

  getProductDetails: async (req, res) => {
    const isLoggedIn = req.session.user ? true : false;

    const productId = req.params.id;

    try {
      const product = await products.findById(productId).exec();

      if (!product) {
        console.log("product not found");
      }

      res.render("user/productdetails", { layout: false, isLoggedIn, product });
    } catch (err) {
      console.error(err);
    }
  },

  getUserhome: async (req, res) => {
    try {
      const id = req.params.id;
      console.log(users);

      const user = await users.findById(id).exec();
      res.render("user/userhome", { layout: false, item: user });
    } catch (err) {
      console.log(err);
    }
  },

  getAddress: async (req, res) => {
    try {
      const addresses = await addr
        .find({ user: res.locals.user._id.toString() })
        .populate("address")
        .exec();
      console.log(addresses);
      res.render("user/manageaddress", { layout: false, addresses: addresses });
    } catch (error) {
      console.log(error);
    }
  },

  getAddAddress: (req, res) => {
    res.render("user/addaddress", { layout: false });
  },

  postAddAddress: async (req, res) => {
    try {
      const userId = res.locals.user._id.toString();

      console.log(req.body, "[[[[");

      const newAddress = new addr({
        user: userId,
        name: req.body.name,
        address: req.body.address,
        pincode: req.body.pincode,
        locality: req.body.locality,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
      });

      await newAddress.save();

      console.log(newAddress);

      await users.findByIdAndUpdate(userId, {
        $push: { addresses: newAddress._id },
      });
      res.redirect("/manageaddress");
    } catch (err) {
      console.log(err);
    }
  },

  getCart: async (req, res) => {
    try {
      const userId = res.locals.user._id.toString();
      console.log("}}}}}}}}}}}}}}}}}}}}}");

      const cart = await carts
        .findOne({ user: userId })
        .populate("products.productId", "title cost image");
      const coupons = await Coupon.find();
      if (cart) {
        const totalPrice = cart.products.reduce((total, item) => {
          if (item.productId) {
            return total + item.productId.cost * item.quantity;
          }
          return total;
        }, 0);

       
        res.render("user/cart", {
          products: cart.products,
          layout: false,
          totalPrice,
          coupons,
        });
      } else {
        const products = [];
        res.render("user/cart", { products, coupons, layout: false });
      }

      console.log("}}}}}}}}}}}}}");
      console.log(cart.products);
    } catch (error) {
      console.error(error);
    }
  },

  addToCart: async (req, res) => {
    try {
      const productId = req.params.id;
      const userId = res.locals.user._id.toString();

      var cart = await carts.findOne({ user: userId });

      if (!cart) {
        cart = new carts({
          user: userId,
          products: [
            {
              productId,
              quantity: 1,
            },
          ],
          totalamount: 0,
        });
      } else {
        let itemFound = false;
        const itemIndex = cart.products.findIndex(
          (item) => item.productId.toString() === productId
        );
        if (itemIndex >= 0) {
          cart.products[itemIndex].quantity += 1;
          itemFound = true;
        }
        if (!itemFound) {
          cart.products.push({ productId, quantity: 1 });
        }
      }
      await cart.save().then((response) => {
        res.redirect("/getcart");
      });
    } catch (error) {
      console.error(error);
    }
  },

  changeProductQuantity: async (req, res) => {
    console.log("hhihihiho");
    try {
      const { productId } = req.query;
      const { count } = req.query;
      const userId = res.locals.user._id.toString();

      var countNumber = parseInt(count);

      console.log(countNumber);

      const cart = await carts.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ error: "cart not found" });
      }

      const product = cart.products.find(
        (item) => item.productId.toString() === productId
      );
      if (!product) {
        return res.status(404).json({ error: "product not found in the cart" });
      }

      product.quantity = product.quantity + countNumber;
      await cart.save();
      const totalPrice = cart.products.reduce((total, item) => {
        return total + item.productId.cost * item.quantity;
      }, 0);
      res.json({
        totalAmount: totalPrice,
        itemTotal: product.productId.cost * product.quantity,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "internal server error" });
    }
  },

  removeFromCart: async (req, res) => {
    try {
      const productId = req.params.id.toString();
      console.log("{{{{{{{");
      console.log(productId);
      const userId = res.locals.user._id.toString();

      const cart = await carts.findOne({ user: userId });
      if (!cart) {
        return res.redirect("/");
      }

      const productIndex = cart.products.findIndex(
        (product) => product.productId._id.toString() === productId
      );
      if (productIndex === -1) {
        return res.redirect("/");
      }
      cart.products.splice(productIndex, 1);
      await cart.save();
      console.log(cart.products);
      res.redirect("/getcart");
    } catch (error) {
      console.error(error);
    }
  },

  getCheckOut: async (req, res) => {
    try {
      const productId = req.params.id;
      const user = res.locals.user._id.toString();
      const coupons = await Coupon.find();
      const cartProducts = await carts
        .findOne({ user })
        .populate("products.productId", "title cost image");
      const totalPrice = cartProducts.products.reduce((total, item) => {
        return total + item.productId.cost * item.quantity;
      }, 0);
     
     const selectedAddress = await addr.findOne({user , selected : true})

      
     

      res.render("user/checkout", {
        selectedAddress,
        cartProducts,
        key_id: "rzp_test_WQ1zeBdFUny6Zs",
        amount: totalPrice,
        currency: "INR",
        order_id: "orderId",
        layout: false,
        totalPrice,
        coupons
       
      });

      console.log('fvefavefvefv',selectedAddress);
    } catch (error) {
      console.error(error);
    }
  },

  getOrders: async (req, res) => {
    try {
      const userId = res.locals.user._id.toString();
      const orders = await Orders.find({ user: userId })
        .populate({
          path: "products.productId",
          select: "title cost",
        })
        .select(
          "orderId customerName email address contactNumber pincode orderDate paymentMethod status totalPrice"
        );

      console.log(orders);

      const formattedOrders = orders.map((order) => ({
        ...order._doc,
        orderDate: order.orderDate.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
      }));

      console.log(formattedOrders);

      res.render("user/orders", { orders: formattedOrders, layout: false });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

    postPlaceOrder: async (req, res) => {
    try {
      console.log("checkout//");
      const user = res.locals.user._id.toString();
      const userAddress = await addr.findOne({ user });
      const paymentMethod = req.body.paymentMethod;
      const updatedTotalAmount = parseFloat(req.body.updatedTotalAmount)


      const cartProducts = await carts
        .findOne({ user })
        .populate("products.productId", "title cost image");

      console.log("jjhhhgghjj/");

      console.log(cartProducts);

      let totalPrice = cartProducts.products.reduce((total, item) => {
        return total + item.productId.cost * item.quantity;
      }, 0);
      console.log(totalPrice);
      console.log(cartProducts);

      if(req.session.coupon){
          totalPrice = totalPrice - req.session.coupon.discount
      }

      const orderedProducts = cartProducts.products.map((item) => {
        return {
          productId: item.productId._id,
          quantity: item.quantity,
        };
      });
      console.log("/////////");

      if (paymentMethod === "cod") {
        // Payment is cash on delivery
        const newOrder = new Orders({
          user: user,
          customerName: userAddress.name,
          email: userAddress.email,
          address: userAddress.address,
          contactNumber: userAddress.phonenumber,
          pincode: userAddress.pincode,
          orderDate: new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          }),
          status: "Placed",
          products: orderedProducts,
          paymentMethod: paymentMethod,
        });

        await newOrder.save();
        console.log("check2///");
        await cartProducts.save();
        
        await carts.deleteOne({ user });
        res.render("user/order-confirmation", { layout: false });
      } else {
        const instance = new Razorpay({
          key_id: "rzp_test_KdbN9LDcadJzNj",
          key_secret: "K1Zvn561Co6xA7PkUVJfInRW",
        });
      
        console.log(totalPrice,'/////////');
        const order = instance.orders.create({
          amount: totalPrice * 100,
          currency: "INR",
          receipt: "receipt#1",
          notes: {
            key1: "value3",
            key2: "value2",
          },
        });

        const orderedProducts = cartProducts.products.map((item) => {
          return {
            productId: item.productId._id,
            quantity: item.quantity,
          };
        });
        console.log(orderedProducts);
        const newOrder = new Orders({
          user: user,
          customerName: userAddress.name,
          email: userAddress.email,
          address: userAddress.address,
          contactNumber: userAddress.phonenumber,
          pincode: userAddress.pincode,
          orderDate: new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          }),
          products: orderedProducts,
          status: "Placed",
          paymentMethod: paymentMethod,
          orderId: order.id,
          amount: totalPrice,
        });
        console.log(newOrder);
        console.log(totalPrice);

        await newOrder.save();
        
       
        req.session.coupon = null
        
        await carts.deleteOne({ user });
        // Pass the order details to the client-side for payment processing
        res.render("user/razorpay-payment", {
          order_id: order.id,
          amount: totalPrice,
          currency: "INR",
          key_id: "rzp_test_KdbN9LDcadJzNj",
          layout: false,
        });
      }

     
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "server error" });
    }
  },

  getOrderProducts: async (req, res) => {
    const orderId = req.query.orderId;
    try {
      const order = await Orders.findById(orderId).populate(
        "products.productId"
      );
      const productIds = order.products.map((item) => item.productId);
      const orderedProducts = await products.find({ _id: { $in: productIds } });
      console.log(orderedProducts,req.session.userdetails,'/////////ordered ');
      const userName = req.session.userdetails.name
      res.render("user/orderedproducts", {
        orderedProducts: orderedProducts,userName,
        layout: false,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("error");
    }
  },

  orderCreation: (req, res) => {
    const { amount } = req.body.totalPrice;
    const options = {
      amount: amount,
      currency: "INR",
      name: "tObytOne",
      reciept: "order_reciept",
    };
    instance.orders.create(options, (err, order) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "failed to create order" });
      } else {
        res.json({ orderId: order.id });
      }
      console.log(order);
    });
  },

  filterProducts: async (req, res) => {
    try {
      const { priceFilters } = req.query;
      const query = {};
      if (Array.isArray(priceFilters) && priceFilters.length > 0) {
        const priceRanges = {
          1: { cost: { $gte: 0, $lte: 500 } },
          2: { cost: { $gte: 500, $lte: 1000 } },
          3: { cost: { $gte: 1000, $lte: 1500 } },
          4: { cost: { $gte: 1500, $lte: 2000 } },
        };
        const selectedPriceRanges = priceFilters.map(
          (filter) => priceRanges[filter]
        );
        query.$or = selectedPriceRanges;
      } else {
        query.cost = { $exists: true };
      }
      const filteredProducts = await products.find(query);
      res.json(filteredProducts);
      console.log(filteredProducts);
    } catch (error) {
      console.error("error", error);
      res.status(500).json({ error: "failed to fetch products" });
    }
  },

  sortProducts: async (req, res) => {
    const category = req.params.category;
    try {
      if (category === "Show All") {
        const alltheproducts = await products.find();
        console.log(alltheproducts);
        res.json(alltheproducts);
      } else {
        const sortProducts = await products.find({ mycategory: category });
        res.json(sortProducts);
      }
    } catch (error) {
      console.error("error : ", error);
      res.status(500).json({ error: "failed to fetch products by category" });
    }
  },

  searchProducts: async (req, res) => {
    const searchTerm = req.query.term;
    try {
      const searchResults = await products.find({
        title: { $regex: searchTerm, $options: "i" },
      });
      res.json(searchResults);
    } catch (err) {
      res.status(500).json({ error: "an error occured" });
    }
  },

  getCoupon: async (req, res) => {
    try {
      const coupon = await Coupon.find({ isActive: true });
      console.log(coupon);
      if (coupon && !coupon.isUsed) {
        res.json(coupon);
      } else {
        res.status(404).json({ messsage: "no coupons available" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "server error" });
    }
  },

  applyCoupon : async(req,res)=>{
    try{
      console.log('reached');
      const userId = res.locals.user._id.toString();
      const couponCode = req.params.couponCode;
      const coupon = await Coupon.findOne({code : couponCode});

      if(!coupon){
        return res.status(404).json({message : 'coupon code not found.'});
      }

      const user = await users.findById(userId).populate('usedCoupons');
      const hasUsedCoupon = user.usedCoupons.some(usedCoupon=>usedCoupon.equals(coupon._id));

      if(hasUsedCoupon){
        return res.status(400).json({message : 'coupon has already been used by the user'});
      }

      const totalPrice = parseFloat(req.query.totalPrice);
      let updatedTotalPrice = totalPrice;
      let discountAmount = 0;
      console.log(totalPrice);

      if(coupon.isActive && coupon.expirationDate>new Date()){
        if(coupon.amountType === 'amount'){
          discountAmount = parseFloat(coupon.discount);
          updatedTotalPrice = totalPrice - discountAmount;
        }else if(coupon.amountType === 'percentage'){
          const discountPercentage = parseFloat(coupon.discount)/100;
          discountAmount = totalPrice * discountPercentage;
          updatedTotalPrice = totalPrice - discountAmount;
        }

        user.usedCoupons.push(coupon);
        await user.save();

        coupon.isActive = false;
        await coupon.save();

        console.log('before');
       

        req.session.coupon = coupon;

        console.log('after');
      
      return res.json({discountAmount,updatedTotalPrice});
       
      }else{
        return res.status(400).json({message : 'coupon is not active or has expired'});
      }
    }catch(error){
      console.error('error applying coupon : ',error);
      return res.status(500).json({message : 'internal server error'});
    }
  },
  
  checkCoupon: async (req, res) => {
    try {
      const { code } = req.query;
      const coupon = await Coupon.findOne({ code: code });
      if (!coupon) {
        return res.json({ isValid: false, discount: 0 });
      }
      if (!coupon.isActive) {
        return res.json({ isValid: false, discount: 0 });
      }

      if (coupon.expirationDate < Date.now()) {
        return res.json({ isValid: false, discount: 0 });
      }

      if (coupon.amountType === "amount") {
        return res.json({
          isValid: true,
          discount: parseFloat(coupon.discount),
        });
      } else if (coupon.amountType === "percentage") {
        const percentageDiscount = parseFloat(coupon.discount) / 100;
        return res.json({ isValid: true, discount: percentageDiscount });
      } else {
        return res.json({ isValid: false, discount: 0 });
      }
    } catch (error) {
      console.error("error checking coupon : ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getInvoice : async(req,res)=>{
    const {orderid} = req.params
    console.log(orderid,req.params);
    const orderDetails =  await Orders.findById({_id:orderid}).populate(
      "products.productId"
    );
    console.log(orderDetails.products[0],'hjavbfhk',orderDetails)
    res.render('user/invoice',{layout:false,orderDetails})
  },

  updateAddress : async(req,res)=>{
    try{
      const userId = res.locals.user._id.toString();
      const updatedAddress = req.body;
      console.log(updatedAddress);

      const result = await addr.findOneAndUpdate({user : userId, selected : true },{$set : updatedAddress} , {new : true});
      await result.save();
      console.log(result);
      if(result){
        res.status(200).json({message : 'address updated successfully',updatedAddress : result})
      }else{
        res.status(404).json({message : 'address not found for the user'});
      }
    }catch(error){
      console.error(error);
      res.status(500).json({message : 'error updating address'});
    }
  },

  selectAddress : async(req,res)=>{
    try{
      const userId = res.locals.user._id.toString();
      const selectedAddressId = req.params.addressId;

      await addr.updateMany(
        {user : userId},
        {$set : {selected : false}}
      );
      await addr.findByIdAndUpdate(selectedAddressId,{selected : true});
      res.sendStatus(200);
    }catch(error){
      console.error('error selecting address : ',error);
      res.status(500).send('internal server error');
    }
  },

  deleteAddress : async(req,res)=>{

    const addressId = req.params.addressId;
    try{
     const result = await addr.deleteOne({_id : addressId});
     return result;
    }catch(error){
      console.error('error deleting address : ',error);
      res.status(500).send('error deleting address');
  }

  
},
}
