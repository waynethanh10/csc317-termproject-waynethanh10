var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var handlebars = require('express-handlebars');

var flash = require('express-flash')
var session = require('express-session')

const fileUpload = require('express-fileupload');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var errorPrint = require('./helpers/debug/debugprinters').errorPrint();
var requestPrint = require('./helpers/debug/debugprinters').requestPrint();

var app = express()

app.use(fileUpload());

app.engine(
    "hbs",
    handlebars({
        layoutsDir: path.join(__dirname,"views/layouts"),
        partialsDir: path.join(__dirname,"views/partials"),
        extname: ".hbs",
        defaultLayout: "home",
        helpers: {

        }
    })
);
app.set("view engine", "hbs");

app.use(session({
  secret: '123456',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public",express.static(path.join(__dirname, 'public')));

app.use((req,res, next) =>{
     //   requestPrint(req.url);
        next();
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use((err, req, res, next) =>{
        console.log(err);
        res.render('error', {err_message: err});

});

module.exports = app;
