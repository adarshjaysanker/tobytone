var express = require("express");
const {
  addproduct,
  deleteProduct,
  getProductById,
  update,
  addcategory,
  displayCategory,
  deleteCategory,
  findEditCategory,
  updateCategory,
  adduser,
  paginate,
  calculateOrderTotal,
} = require("../../helpers/product-helpers");
const products = require("../../model/products");
const users = require("../../model/users");
const cart = require('../../model/cart');
const { blockStatusUpdate } = require('../../helpers/admin-helper');
const Orders = require('../../model/orders');
const moment = require('moment');
const chart = require('chart.js');
const multer = require('multer');
const Banner = require("../../model/banner");
const orders = require("../../model/orders");
const Coupon = require("../../model/coupon");

const router = express.Router();




module.exports = {
  postAddProduct: function (req, res) {
    console.log("[[[[[[[[[[[[[[[[");
    console.log(req.files);
    console.log(req.body);
    const images = [];
    if (req.files.image1) {
      images.push(req.files.image1[0].filename);
    }
    if (req.files.image2) {
      images.push(req.files.image2[0].filename);
    }
    if (req.files.image3) {
      images.push(req.files.image3[0].filename);
    }

    if (req.files.image4) {
      images.push(req.files.image4.filename);
    }
    console.log(images, "+++++++++++++++++");
    productDetails = req.body;
    //image = req.files;
    console.log(productDetails);
    addproduct(productDetails, images)
      .then(function () {
        console.log("success");
        res.redirect("/admin/allproducts");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("error adding product");
      });
  },

  displayProducts: (req, res) => {
    products
      .find()
      .exec()
      .then((productlist) => {
        res.render("admin/allproducts", { items: productlist, layout: false });
        console.log(productlist,"uuuuuuu");
      })
      .catch((err) => {
        console.error(err);
      });
  },

  getDeleteProduct: (req, res) => {
    const id = req.params.id;
    deleteProduct(id)
      .then(() => {
        res.redirect("/admin/allproducts");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  getEditProducts: (req, res) => {
    const id = req.params.id;
    console.log(req.file, "]]]]]]]]]]]]]]]");
    console.log(products);
    getProductById(id)
      .then((product) => {
        res.render("admin/edit", { item: product, layout: false });
      })
      .catch((err) => {
        console.log(err);
      });
  },

  updateproduct: (req, res) => {
    const id = req.params.id;
    const details = req.body;

    update(id, details)
      .then(() => {
        return products.find({});
      })
      .then((products) => {
        res.render("admin/allproducts", { items: products , layout : false});
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/admin/addproduct");
      });
  },

  postaddcategory: async (req, res) => {
    const categorydetails = req.body;
    const images = [];
    if(req.files.image1){
      images.push(req.files.image1[0].filename)
    }

    console.log(images)
    

    
    const categories = await displayCategory();
    console.log(categorydetails);
    addcategory(categorydetails,images)
      .then(() => {
        res.redirect("/admin/categories");

      })
      .catch((error) => {
        console.log(error);
        res.render("admin/categories", {
          layout: false,
          categories,
          errorMessage: error.error,
        });
      });
  },
  getCategory: (req, res) => {
    displayCategory().then((response) => {
      res.render("admin/categories", { layout: false, categories: response });
    });
  },
  getDeleteCategory: (req, res) => {
    deleteCategory(req.params.id)
      .then((response) => {
        res.redirect("/admin/categories");
      })
      .catch((err) => {});
  },
  getEditCategory: async (req, res) => {
    const categories = await displayCategory();

    findEditCategory(req.params.id).then((response) => {
      res.render("admin/categories", {
        layout: false,
        categories,
        category: response,
      });
    });
  },

  posteditcategory: (req, res) => {
    console.log("i");
    const details = req.body;
    const id = req.params.id;
    updateCategory(details, id)
      .then(() => {
        res.redirect("/admin/categories");
      })
      .catch((error) => {
        console.log(error);
      });
  },

  getadduser: (req, res) => {
    res.render("admin/adduser");
  },

  postAddUser: (req, res) => {
    const userDetails = req.body;
    console.log(userDetails);
    adduser(userDetails)
      .then(function () {
        console.log("successfully added");
        res.redirect("/admin/userlist");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  userlist: (req, res) => {
    users
      .find()
      .exec()
      .then((userlist) => {
        res.render("admin/userlist", { users: userlist });
        console.log(userlist);
      })
      .catch((err) => {
        console.log(err);
      });
  },

  postUserStatus: (req, res) => {
    const { userId, status } = req.body;
    blockStatusUpdate(userId)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.json(err);
      });
  },


  getPage:(req,res)=>{
    const pageSize=req.query.pagesize
    const currentPage=req.query.page
     paginate(pageSize,currentPage).then((response)=>{
       // res.render('productList',{ layout: 'layouts/admin/adminLayout',products:response})
       res.render("admin/allproducts", { items: response, layout: false });

     }).catch(err=>{
        console.log(err)
     })

    

 },

 getOrders : async(req,res)=>{
  try{
    const orders = await Orders.find();
    res.render('admin/orderlist',{products : orders.products , orders , layout : false});
  }catch(err){
    console.error(err);
    res.status(500).send('internal server error');
  }
 },


 renderSalesReportPage : async(req,res)=>{
  try{
    const orderData = await Orders.find().populate({
      path : 'products.productId',
      model : 'products',
    });
    let totalRevenue = 0;
    orderData.forEach(order=>{
      let totalAmount = 0;
      order.products.forEach(product=>{
       if(product.productId && product.productId.cost){
        totalAmount += product.quantity * product.productId.cost;
       }
      });
      order.amount = totalAmount;
      totalRevenue += totalAmount;
    });
    console.log(orderData);
    res.render('admin/sales',{orders : orderData , totalRevenue : totalRevenue});
  }catch(err){
    console.error('error fetching data : ',err);
    res.status(500).send('error fetching data');
  }
 },

 
  
 
 getBanner : async(req,res)=>{
  try{
    const banners = await Banner.find().exec();
    console.log(banners,"yyyy");
    res.render('admin/banner',{banners : banners});
  }catch(error){
    console.error(error);
    res.status(500).json({error : 'failed to render banners'});
  }
 },

 

 addBanner : async(req,res)=>{
  try{
    const {bannerTitle} = req.body;
    const bannerImage = req.file?req.file.filename : null;
    const banner = new Banner({
      title : bannerTitle,
      image : bannerImage,
    });
    await banner.save();
    res.json({success : true ,message : 'the banner is added successfully'});
  }catch(error){
    console.error(error);
    res.status(500).json({success : false , error : 'failed to add the banner'})
  }
 },

 deleteBanner : async(req,res)=>{
  try{
    const bannerId = req.params.id;
    await Banner.findByIdAndDelete(bannerId);
    res.json({success : true, message : 'banner deleted successfully'});
  }catch(error){
    console.error(error);
    res.status(500).json({success : false, error : 'failed to delete the banner'});
  }
 },

 salesByPeriod : async(req,res)=>{
  try{
    const period = req.params.period;
    let startDate, endDate;
    if(period === 'daily'){
      startDate = new Date();
      endDate = new Date();
      startDate.setHours(0,0,0,0);
      endDate.setHours(23,59,59,999);
      console.log(startDate,'fgeargegvber');
    }else if(period === 'weekly'){
      const today = new Date();
      const dayOfWeek = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate()-dayOfWeek);
      startDate.setHours(0,0,0,0);
      endDate = new Date(today);
      endDate.setDate(today.getDate()+(6-dayOfWeek));
      endDate.setHours(23,59,59,999);
    }else if(period === 'yearly'){
      const today = new Date();
      startDate = new Date(today.getFullYear(),0,1);
      startDate.setHours(0,0,0,0);
      endDate = new Date(today.getFullYear(),11,31);
      endDate.setHours(23,59,59,999);
    }else if(period === 'all'){
      const allOrders = await Orders.find().populate({
        path : 'products.productId',
        model : 'products',
      });
      return res.json(allOrders);
    }else{
      return res.status(400).json({error : 'invalid time period specified. '});
    }

    const filteredOrders = await Orders.find({
      orderDate : {$gte : startDate, $lte : endDate},
    }).populate({
      path : 'products.productId',
      model : 'products',
    })
    res.json(filteredOrders);
  }catch(error){
    console.error('error fetching sales data : ',error);
    res.status(500).json({error: 'Internal server error'});
  }
 },

 
 dashboardRender : async(req,res)=>{
  try{


    let result = await Orders.aggregate([
      {
        '$match': {
          'status': 'Pending'
        }
      }, {
        '$group': {
          '_id': {
            'month': {
              '$month': '$orderDate'
            }
          }, 
          'count': {
            '$sum': 1
          },
          'revenue' : {
            '$sum' : '$amount'
          }
        }
      }
    ]);

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sept',
      'Oct',
      'Nov',
      'Dec'
    ]
  
  
  const finalResult = months.map((month, index) => {
    const monthData = result.find((item) => item._id.month === index + 1);

    if (monthData) {
      return {
        count: monthData.count,
        month: month,
        revenue : monthData.revenue,
        
      };
    } else {
      return {
        count: 0,
        month: month,
        revenue : 0
       
      };
    }
  });

  const orderData = await Orders.find({status : 'Placed'}).populate({
    path : 'products.productId',
    model : 'products',
  });
 
  let totalRevenue = 0;
  let totalOrders = 0;

  orderData.forEach(order=>{
    
    let totalAmount = 0;
    order.products.forEach(product=>{
      if(product.productId && product.productId.cost){
        totalAmount += product.quantity * product.productId.cost;
      }
    });
    order.amount = totalAmount;
    totalRevenue += totalAmount;
    totalOrders += 1;
  });

  const totalProducts = await products.countDocuments();
  const categories = await products.distinct('mycategory');
  const totalCategories = categories.length;
 

  console.log("//////////////////");
  console.log(finalResult);
  
    res.render('admin/dashboard',{finalResult , orders : orderData , totalRevenue : totalRevenue , totalOrders : totalOrders , totalProducts : totalProducts , totalCategories : totalCategories});

  }catch(error){
    console.error('error : ', error)
  }
 },

 renderCouponPage : async(req,res)=>{
  try{
    res.render('admin/couponmanagement');
  }catch(error){
    console.error(error);
    res.status(500).json({message : 'server error'})
  }
 },

 addCoupon : async(req,res)=>{
  try{
    const {offerName, discount, expirationDate, amountType} = req.body;
    const couponCode = generateRandomCouponCode();

    const newCoupon = new Coupon({
      offer : offerName,
      code : couponCode,
      discount : discount,
      amountType : amountType,
      expirationDate : expirationDate,
      isActive : true,
    });

    await newCoupon.save();
    res.status(201).json({couponCode});
  }catch(error){
    res.status(500).json({message : 'coupon generation failed'});
  }

  function generateRandomCouponCode(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for(let i=0;i<7;i++){
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

 },

 getAllCoupons : async(req,res)=>{
  try{
    const coupons = await Coupon.find();
    res.json({coupons : coupons});
  }catch(error){
    res.status(500).json({error : 'failed to fetch coupons'});
  }
 },

 getOrderDates : async(req,res)=>{
  try{
    const orderDates = await Orders.distinct('orderDate');
    res.json(orderDates);
  }catch(error){
    res.status(500).json({error : 'internal server error'});
  }
 },

 getSalesByDate : async(req,res)=>{
  const selectedDate = new Date(req.query.date);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate()+1);
  console.log(selectedDate);

  try{
    const filteredSalesData = await Orders.find({
      orderDate : {$gte : selectedDate, $lt : nextDay}
    }).populate({
      path : 'products.productId',
      model : 'products',
    });
    res.json(filteredSalesData);
  }catch(error){
    res.status(500).json({error : 'internal server error'});
  }
 },

 filterSalesDatePicker : async(req,res)=>{
  try{
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    const orderData = await Orders.find({
      orderDate : {$gte : startDate, $lte : endDate}
    }).populate({
      path : 'products.productId',
      model : 'products'
    });

    let totalRevenue = 0;
    orderData.forEach(order=>{
      let totalAmount = 0;
      order.products.forEach(product=>{
       if(product.productId && product.productId.cost){
        totalAmount += product.quantity * product.productId.cost;
       }
      });
      order.amount = totalAmount;
      totalRevenue += totalAmount;
    });

    res.json(orderData)
  }catch(err){
    console.error('error fetching filtered data : ',err);
    res.status(500).json({error: 'error fetching filtered data'});
  }
 },

 updateOrderStatus : async(req,res)=>{
  try{
    const {orderId , newStatus} = req.body;
    const order = await Orders.findByIdAndUpdate(orderId, {status : newStatus}, {new : true});
    if(!order){
      return res.status(404).json({message : 'order not found'});
    }
    return res.status(200).json({message : 'order status updated successfully' , order});
  }catch(error){
    console.error('error',error);
    res.status(500).json({message : 'server error'});
  }
 },

 getOrderSummary: async (req, res) => {
  const orderId = req.query.orderId;
  try {
    const order = await Orders.findById(orderId).populate(
      "products.productId"
    );
    const productIds = order.products.map((item) => item.productId);
    const orderedProducts = await products.find({ _id: { $in: productIds } });
    console.log(orderedProducts,req.session.userdetails,'/////////ordered ');
    const userName = req.session.userdetails.name
    res.render("admin/ordersummary", {
      orderedProducts: orderedProducts,userName,
      layout: false,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
},

getOrderSummary : async(req,res)=>{
  try{
    const orderId = req.query.orderId;
    const order = await Orders.findById(orderId).populate('products.productId');
    if(!order){
      return res.status(404).json({error : 'order not found'});
    }

    res.json(order);
  }catch(error){
    console.error(error);
    res.status(500).json({error : 'internal server error'});
  }
}

}