//Dependencies
let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let db = require('./api/models/db');
let model = require('./api/models/model');
let homeRoute = require('./api/routes/homeRoute')

// define port
let port = process.env.PORT || 3000;

//Connect to DATABASE
db.connect((err) => {
  if(err)
    console.log(err)
  else
    console.log("DATABASE CONNECTED")
})

// Initialize express app
let app = express();

//Use Cookie Parser
app.use(cookieParser());

//Use Express Sessions
app.use(session({secret: 'idsffeiqie2132mkasmaodaa', resave: true, saveUninitialized: false}));

//Body-parser to accept POST requests
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Set static directory
app.use(express.static(__dirname+'/src/'));

//Set views directory and view engine to render ejs
app.set('views', __dirname+'/src/views');
app.set('view engine', 'ejs');

//Routes Start
app.use('/', homeRoute);

//Listen http requests to defined port
app.listen(port, () => {
  console.log("SERVER is LIVE at port "+port);
})