var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var express = require('express');
var mongoose = require('mongoose');
var cors = require('cors')
var expressValidator  = require('express-validator');//req.checkbody()
const mongoConfig = require('./configs/mongo-config')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

mongoose
  .connect(mongoConfig.url, {
    useNewUrlParser: true,
    useCreateIndex: true
    //useCreateIndex
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    // initial();
 
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

var app = express()
app.use(cors())

// Express validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root          = namespace.shift(),
    formParam     = root;

    while(namespace.lenght) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//set static dir
app.use(express.static(path.join(__dirname, 'public')));

//hosting server
// app.use("/", express.static(path.join(__dirname, "public", "build")));

// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "public", "build", "index.html"));
// });

//routers
app.use(express.json());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // console.log(err);
  res.status(err.status || 500).json(err);
});

module.exports = app;