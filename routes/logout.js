var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
