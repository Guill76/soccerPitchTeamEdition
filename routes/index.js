var path = require('path');
var bcrypt = require ('bcryptjs') ;
var mongoose = require('mongoose');
var sess;
// Mongoose connection to MongoDB
mongoose.connect('mongodb://172.30.24.187:27017/db_Mapping', function (error) {
    if (error) {
        console.log(error);
    }
});
var Schema = mongoose.Schema;
var JsonSchemaSoccerPitchItem = new Schema({
    user: String,
    widthIRL: Number,
    playerSize: Number,
    type: Number,
    textStyle: String,
    grassStripesNumber: Number,
    id: String,
    renderImgId: String,
    width: Number,
    rateHW: Number,
    IconeFile:{
        ball: String,
        yellowCard: String,
        redCard: String	
    },
    lineWidth: Number,
    grassColor1: String,
    grassColor2: String,
    shadow: Boolean,
    top: {
        x: Number,
        y:Number
    },
    cornerRadius: Number,
    teams: [Schema.Types.Mixed],
    configMenu: Boolean,
    help: Boolean,
    //user: {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'},
    sheetName: String
});

var userSchema=new Schema({
	username: { type: String, require: true, index :true},
	password: { type: String, required: true}
});

// Mongoose Model definition
var JsonSoccer = mongoose.model('JString3', JsonSchemaSoccerPitchItem, 'soccerPitchItems');
var User=mongoose.model('UserModel', userSchema, 'usersItems');

exports.soccerPitch = function (req,res){
    var username='',_sheetName='default';
    sess=req.session;
    //console.log('session enregistree dans fonction soccerpitch: page soccer');
    if (! sess.user){
        res.redirect('/login');
    }
    else {
	    res.render('soccer',{user:sess.user, sheetName:_sheetName, title:'soccerPitch'} );
    }
};

exports.getSheets=function(req,res){
    sess=req.session
    if (sess.user) {
        JsonSoccer.find({'user': sess.user}, {sheetName:1}, function (err, docs) {
            console.log(docs);
            res.json(docs);
        });
    }
};

exports.auth=function (req, res) {
    sess=req.session;
    var _user='', _pass;
    var salt=bcrypt.genSaltSync(10);
	if (req.body.username && req.body.password){
        _pass=bcrypt.hashSync(req.body.password, salt);
		User.findOne({'username':req.body.username}, {}, function (err, result) {
			if (err){
				console.log(err);
				res.status(500).send();
			}
			if (!result) {
				console.log('User not found or failed password');
				res.redirect('/login');
			} else {
				if (!bcrypt.compareSync(req.body.password,result.password)){
					console.log('User not found or failed password');
					res.redirect('/login');
				}
				else {
                    sess.user=req.body.username;
                    sess.password=_pass;
					res.redirect('/soccer');
				}
			}
	    });
	}else {
		console.log ('user requis');
		res.status(404).send();
	}
};

exports.sign=function (req, res) {
    sess=req.session;
    var _user='', _pass='';
    var salt=bcrypt.genSaltSync(10);
	if (req.body.username && req.body.password){
        _user=req.body.username;
        _pass=bcrypt.hashSync(req.body.password, salt);
        User.findOne({'username':req.body.username}, {}, function (err, result) {
			if (err){
				console.log(err);
				res.status(500).send();
			}
			if (!result) {
				console.log('creation USER');
                User.create({'username': _user,'password': _pass}, function (err,list){
                    if (err) {
                        console.log ('Erreur durant la creation du compte');
                        res.status(500).send();
                    }else {
                        sess.user=_user;
                        sess.password=_pass;
                        res.render('userLogin',{title:'identifiez-vous',user:_user, pass:''});
                    }
                });
			} else 
            {
                if (!bcrypt.compareSync(req.body.password,result.password)){
					console.log('Bad name or password');
					//alert('bad name or password');
					res.status(404).send();
				}
				else {
                    console.log('user dejà créé');
					res.status(500).send();
				}
			}
	    });
	}else {
		console.log ('user requis');
		res.status(404).send();
	}
};

exports.jsonsoccer=function (req, res) {
    var username='', sheetName='';
    sess=req.session;
    if (sess.user){
        username=sess.user;
        if (req.query.sheetName) {
            sheetName=req.query.sheetName;
        }
        JsonSoccer.find({'user': username, 'sheetName':sheetName}, {}, function (err, docs) {
            console.log(docs);
            res.json(docs);
        });
    }
};

exports.login = function (req, res) {
    var _user='';
    sess=req.session;
    if (sess.user) {
        _user=sess.user;
    }
    res.render('userLogin',{title:'identifiez-vous',user:_user,pass:''});
};

exports.signin = function (req, res) {
    res.render('userSignin',{title:'Creez votre compte'});
};

exports.saveSoccer = function (req, res) {
    console.log(JSON.stringify(req.body));
    JsonSoccer.remove({_id:req.body._id}, function (err){
        if (err) {
            console.log(err);
            res.status(500).send();
        } else {
            console.log("Document removed: id ="+req.body._id+" Name = " + req.body.sheetName + " _ UID:"+req.body.user);
        }
    });
    JsonSoccer.create(req.body, function (err, list) {
        if (err) {
            console.log(err);
        }
        console.log("\nlist:", list);
    });
    res.send(req.body);
};

