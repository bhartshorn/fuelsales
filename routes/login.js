var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Transactions' });
});

router.post('/',
	passport.authenticate('local', 
		{ 
			successRedirect: '/',
			failureRedirect: '/login',
			failureFlash: true 
		}
	)
);

module.exports = router;
