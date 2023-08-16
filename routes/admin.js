var express = require('express');
var router = express.Router();
const upload=require('../multer');
const products=require('../model/products');
const users=require('../model/users');
const {body,validationResult }=require('express-validator');
const {checkUser,requireAuth}=require('../middlewares/user-middleware')
const Orders = require('../model/orders');
const multer = require('multer');


const { postAddProduct, postaddcategory, getCategory, getDeleteCategory, getEditCategory, posteditcategory, postUserStatus, getPage , getOrders , renderSalesReportPage , addBanner , deleteBanner , getBanner , dashboardRender , renderCouponPage , addCoupon , getAllCoupons , salesByPeriod , getOrderDates , getSalesByDate , filterSalesDatePicker , updateOrderStatus , getOrderSummary}  = require('../controllers/admin/productController');
const { displayProducts } = require('../controllers/admin/productController');
 const {getEditProducts,updateproduct}=require('../controllers/admin/productController');
const {getDeleteProduct}=require('../controllers/admin/productController');
const {userlist,getadduser,postAddUser}=require('../controllers/admin/productController');


const storage = multer.diskStorage({
  destination : function(req, file, cb){
    cb(null, "public/uploads");
  },
  filename : function(req,file,cb){
    cb(null,file.originalname);
  }
})

const uploads = multer({storage : storage});



//const { postaddcategory } = require('../controllers/admin/category');
/* GET home page. */
router.get('/',(req, res, next)=>{
  res.render('admin/signin',{layout:false});
});



router.post('/signin',dashboardRender)
 

router.get('/addproduct',function(req,res,next){
  res.render('admin/addproduct',{layout:false})
});


router.post('/addproduct',upload,postAddProduct);

router.get('/allproducts',displayProducts);

router.get('/deleteproduct/:id',getDeleteProduct);

router.get('/edit/:id',getEditProducts);

router.post('/update',updateproduct);

router.get('/userlist', userlist);



router.get('/categories',getCategory)

router.post('/categories', upload,postaddcategory);
router.get('/categories/delete/:id',getDeleteCategory);
router.get('/categories/edit/:id',getEditCategory);
router.post('/categories/:id',posteditcategory);
router.post('/status-update',checkUser,postUserStatus);

router.get('/orderlist',getOrders)

router.get('/nextpage',getPage)

router.post('/logout',(req,res)=>{
  res.redirect('/admin');
});

router.get('/sales',renderSalesReportPage);




router.get('/banner',getBanner)


router.delete('/banner/:id',deleteBanner);

router.get('/addbanner',(req,res)=>{
  res.render('admin/addbanner');
});

router.post('/addbanner', uploads.single('bannerImage'), addBanner)


router.get('/coupon',renderCouponPage);

router.post('/generatecoupon',addCoupon)

router.get('/getallcoupons',getAllCoupons);

router.get('/salesbyperiod/:period',salesByPeriod);

router.get('/getorderdates',getOrderDates);

router.get('/getsalesbydate/:date',getSalesByDate);

router.get('/filter-sales',filterSalesDatePicker);

router.post('/update-order-status',updateOrderStatus);

router.get('/getordersummary',getOrderSummary);





module.exports = router;
