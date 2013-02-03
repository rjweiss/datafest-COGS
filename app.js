var express = require('express'),
	app = express.createServer()
var mongoose = require ("mongoose")
  , Schema = mongoose.Schema;
var http = require ('http');

// Reference
// http://expressjs.com/guide.html
// https://github.com/spadin/simple-express-static-server
// http://devcenter.heroku.com/articles/node-js

// Configuration
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	// LESS Support
	//app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
	// Template-enabled html view (by jade)
	// http://stackoverflow.com/questions/4529586/render-basic-html-view-in-node-js-express
	//app.set('views', __dirname + '/app/views');
	//app.register('.html', require('jade'));
	
	//Error Handling
	app.use(express.logger());
	app.use(express.errorHandler({
		dumpExceptions: true, 
		showStack: true
	}));
	
	//Setup the Route, you are almost done
	app.use(app.router);
});

//Heroku
var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Listening on " + port);
});

//Mongoose + MongoLab

// Connect to db, localhost if no ENV vars set
var uristring = 
  process.env.MONGODB_URI || 
  process.env.MONGOLAB_URI || //need to make sure it's to s112, and not the default mongodb
  'mongodb://localhost/s112';

// Ensure safe writes
var mongoOptions = { db: { safe: true }};

// Connect
mongoose.connect(uristring, mongoOptions, function (err, res) {
  if (err) { 
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

// Routes
app.get('/', function(req, res){
	//Apache-like static index.html (public/index.html)
	res.redirect("/index.html");
	//Or render from view
	//res.render("index.html")
});

var BillSchema = new Schema({ bill_id: String }, { collection : 'bills' });

var BillModel = mongoose.model('Bill', BillSchema);

app.get('/hello/', function(req, res) {
	res.send("hello world?");
});

app.get('/bill/hr/:id', function(req, res){
	console.log ('Hmmm '+process.env.MONGOLAB_URI);
	var id = "hr"+req.params.id+"-112"
	return BillModel.findOne({ bill_id : id }, function (err, bill) {
		if (!err) {
			return res.send(bill);
		} else {
			return console.log(err);
		}
	});
	
})

// WE ARE GOOD UP TO HERE.

//Create a mongoose schema
/*
var billSchema = mongoose.Schema({ bill_id: 'string' });

var Bill = mongoose.model('Bill', billSchema);
var query = Bill.findOne({});
//query.select('bill_id');

query.exec(function (err, bill) {
  console.log(bill)
  if (err) return handleError(err);

})
*/

