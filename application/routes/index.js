var express = require('express');
var router = express.Router();
const mysql = require('mysql2');

var session = require('express-session')

const { body, validationResult } = require('express-validator');
const sha1 = require('sha1');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'project'
});

/* GET home page. */
router.get('/', function(req, res, next) {
  connection.query(
	  'SELECT * FROM `posts` WHERE 1=1',
	  function(err, results, fields) {
	    console.log(results); // results contains rows returned by server
	    res.render('index', {title:"Photo App",session:req.session.users,posts:results});
	  }
	);	
  //res.render('index', {title:"Photo App",session:req.session.users});
});

router.post('/', function(req, res, next) {
  //next(new Error('test'));
  let term=req.body.term;
  console.log(term)

connection.query(
	  'SELECT * FROM `posts` WHERE `title` LIKE "%'+term+'%" || `description` LIKE "%'+term+'%"',
	  function(err, results, fields) {
	    console.log(results); // results contains rows returned by server
	    res.render('index', {title:"Photo App",session:req.session.users,posts:results});
	  }
	);	


  
});

router.get('/login',(req, res, next) => {
  res.render("login", {title:"Log in"});
});


router.get('/logout',(req, res, next) => {
	req.session.users={}
  res.writeHead(301,
  						{Location: '/login'}
						);
					res.end();
});

router.post('/login',(req, res, next) => {
	var username=req.body.username;
	var password=req.body.password;
	connection.query(
	  'SELECT * FROM `users` WHERE `username` = "'+username+'"',
	  function(err, results, fields) {
	    console.log(results); // results contains rows returned by server
	//    console.log(fields); // fields contains extra meta data about results, if available

	    if(err){
	    	res.render("login", {title:"Log in",errors:err});
	    }else{
	    	if(results.length){
	    		console.log(results)
	    		if(results[0]['password']==sha1(password)){
	    			req.session.users=results[0];
	    			res.writeHead(301,
  						{Location: '/'}
						);
					res.end();
	    		}else{
	    			req.flash('error', 'Wrong password');
	    			res.render("login", {title:"Log in"});
	    		}
	    	}else{
	    		req.flash('error', 'User not found');
	    		res.render("login", {title:"Log in"});
	    	}
	    }
	  }
	);	
	//console.log(req.body)
  //res.render("login", {title:"Log in"});
});

router.get('/registration',(req, res, next) => {
  res.render("registration", {title:"Register"});
});


router.post('/registration',(req, res, next) => {
	let username=req.body.username
	let email=req.body.email
	let pass=req.body.pass
	let passValidation=req.body.passValidation
	let year_13=req.body.year_13
	let accept=req.body.accept
	let errors={}
	pass = sha1(pass);
	if(!year_13 || !accept){
		req.flash('error', 'You must be above 13 and accept the terms');
		res.render("registration", {title:"Register"});
		
		return;
	}
	//res.render("registration", {title:"Log in",errors:errors});
	connection.query(
	  `INSERT INTO \`users\` (\`username\`,\`email\`,\`password\`,\`created\`) VALUES("${username}","${email}","${pass}",NOW())`,
	  function(err, results, fields) {
	    console.log(results); // results contains rows returned by server
	    //console.log(fields); // fields contains extra meta data about results, if available
	    console.log(err);
	    if(!err){
	    	req.session.users=results[0];
	    			res.writeHead(301,
  						{Location: '/login'}
						);
					res.end();
	    }else{
	    	res.render("registration", {title:"Register",errors:errors});
	    }
	  }
	);

  //res.render("registration", {title:"Register"});
});

router.get('/postimage',(req, res, next) => {
	if(!req.session.users){
		res.writeHead(301,
  						{Location: '/login'}
						);
					res.end();
	}
  res.render("postimage", {title:"Create a Post",session:req.session.users});
});

router.post('/postimage',(req, res, next) => {
	let title=req.body.title
	let description=req.body.description
	let accept=req.body.accept
	let filename=req.files.img.name

	if(!accept){
		req.flash('error', 'You must  accept the terms');
		res.render("postimage", {title:"Create a Post"});
		
		return;
	}


	req.files.img.mv('./public/images/'+req.files.img.name,function(err){
		if(!err){
			connection.query(
			  `INSERT INTO \`posts\` (\`title\`,\`description\`,\`img\`,\`created\`) VALUES("${title}","${description}","${filename}",NOW())`,
			  function(err, results, fields) {
			    console.log(results); // results contains rows returned by server
//			    console.log(fields); // fields contains extra meta data about results, if available
			    if(!err){
			    	res.render("postimage", {title:"Create a Post",file:req.files.img.name,session:req.session.users});
			    }else{
			    	res.render("postimage", {title:"Create a Post",file:req.files.img.name,session:req.session.users,errors:err});
			    }
			  }
			);
		}
	})
	
	//res.write('ok')
	//res.end();
  	//res.render("postimage", {title:"Create a Post",file:req.files.img.name,session:req.session.users});
});

router.get('/post',(req, res, next) => {
	let id=req.query.id
	connection.query(
	  'SELECT posts.*, comments.text FROM `posts` LEFT OUTER JOIN `comments` ON posts.id=comments.post_id WHERE posts.id='+id,
	  function(err, results, fields) {
	    console.log(err); // results contains rows returned by server
	    connection.query('SELECT * FROM comments WHERE post_id='+id,function(err,results2,fields){
	    	res.render("post", {title:"Post",post:results[0],comments:results2});	
	    });
	  }
	);	
  
});

router.post('/post',(req, res, next) => {
	let id=req.body.id
	let comment=req.body.comment
	connection.query(
	  `INSERT INTO \`comments\` (\`post_id\`,\`text\`,\`created\`) VALUES(${id},"${comment}",NOW())`,
	  function(err, results, fields) {
	  	console.log(err)
	    if(!err){
	    	req.session.users=results[0];
	    			res.writeHead(301,
  						{Location: '/post?id='+id}
						);
					res.end();
	    }else{
	    	connection.query(
	  'SELECT posts.*, comments.text FROM `posts` LEFT OUTER JOIN `comments` ON posts.id=comments.post_id WHERE posts.id='+id,
	  function(err, results, fields) {
	    console.log(err); // results contains rows returned by server
	    connection.query('SELECT * FROM comments WHERE post_id='+id,function(err,results2,fields){
	    	res.render("post", {title:"Post",post:results[0],comments:results2});	
	    });
	    
	  }
	);	
	    }
	  }
	);	
  
});


module.exports = router;
