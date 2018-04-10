const users = require('./dbusers.js')

function checkLogin (identifier, password, done) {
	users.checkUser(identifier, (err, username) => {
		if (err) return done(err);

		if(!username) {
			console.log('User not found');
			return done(null, false);
		}

		users.authUser(username, password, (err, success) => {
			if (err) return done(err);

			if (success) return done(null, username);

			console.log('Incorrect Password');
			return done(null, false);
		});
	});
}

function jsonMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    return res.status(401).json({error: 'Not Authenticated'});
  }
}

function htmlMiddleware () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    return res.redirect('/login')
  }
}

function serialize (username, done) {
	return done(null, username);
}

module.exports = {checkLogin, jsonMiddleware, htmlMiddleware, serialize};
