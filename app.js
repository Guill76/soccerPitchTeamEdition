var express=require ('express');
var session=require ('express-session');
var app=express();
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
app.set('view engine', 'jade');
var bodyParser = require('body-parser');
app.use(session({
    secret:'ImTheNumberOne4LongTime',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var path = require('path');
var routes=require('./routes');
var port=8080;
app.use(express.static(path.join(__dirname, '/public')));

// parse application/json

//routes
app.get('/soccer', routes.soccerPitch);
app.get('/jsonsoccer', routes.jsonsoccer);
app.get('/getSheets',routes.getSheets);
app.post('/savingSoccerPitch', routes.saveSoccer);
app.get('/',function (req,res){
	res.redirect('/login');
});
app.post('/auth', routes.auth);
app.get('/login', routes.login);
app.get('/signin', routes.signin);
app.post('/sign', routes.sign);

app.listen(server_port,server_ip_address, function(){
    console.log("application en cours d'execution sur le port "+port);	
    });
