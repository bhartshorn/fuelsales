const users = require('./dbusers.js')

function checkLogin (username, password, done) {
	users.checkUser(username, (err, user) => {
		if (err) return done(err);

		if(!user) {
			//console.log('User not found');
			return done(null, false);
		}

		users.authUser(username, password, (err, success) => {
			if (err) return done(err);

			if (success) return done(null, user);

			//console.log('Incorrect Password');
			return done(null, false);
		});
	});
}

module.exports = checkLogin;
