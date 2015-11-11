var express = require('express');
var router = express.Router();
var passport = require('passport');
var Account = require('../models/account');
/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: req.user });
});
router.get('/admin', function(req, res) {
	res.render('login', { user : req.user });
});
router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/admin');
});
router.get('/register', function(req, res) {
	res.render('register', { });
});
router.post('/register', function(req, res) {
	Account.register(new Account({ username : req.body.username }),
	req.body.password, function(err, account) {
		if (err) {
			console.log (err);
			return res.render('register', { account : account });
		}
		passport.authenticate('local')(req, res, function () {
			res.redirect('/');
		});
	});
});

module.exports = router;
