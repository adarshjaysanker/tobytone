require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var upload = require('multer');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose=require('mongoose');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const expressLayouts=require('express-ejs-layouts');
const session=require('express-session');
const {body,validationResult }=require('express-validator');
const Chart = require('chart.js');
const cropper = require('cropper');




var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


var indexRouter = require('./routes/admin');
var usersRouter = require('./routes/users');



// view engine setup
app.set('views', path.join(__dirname, 'views'));

// app.engine('hbs', hbs.engine)
// app.set('view engine', 'hbs')
app.use(expressLayouts)
app.set('view engine', 'ejs');
app.set('layout','admin/layout')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

app.use(session({
  secret:'your-secret-key',
  resave:false,
  saveUninitialized:true
}));


mongoose.connect('mongodb+srv://jeena:jeenasebadarsh@cluster0.kkpdgnq.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.log('Error connecting to MongoDB:', error);
});


app.use('/',usersRouter);
app.use('/admin',indexRouter);

 //catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('admin/error',{layout : false})
  next(createError(404));
});

//error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  //res.locals.message = err.message;
 // res.locals.error = req.app.get('env') === 'development' ? err : {};

   //render the error page
  res.status(err.status || 500 );
 // res.render('admin/error');
});
app.locals.category=''
app.locals.errorMessage=''

module.exports = app;
