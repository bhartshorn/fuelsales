const { Pool } = require('pg');

// Dirty hack so it will connect on Heroku and Home
var pool = null;
if (process.env.DATABASE_URL) {
	pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl: true,
	});
} else {
	pool = new Pool()
}

function checkUser(identifier, callback) {
	//console.log(identifier);
	pool.query('SELECT id, username FROM users\
		WHERE username = $1 OR email = $1', [identifier],
		(err, results) => {
			if (err) return callback(err, null);
			//console.log(JSON.stringify(results));
			if (results.rowCount > 0) return callback(null, results.rows[0].username);
			return callback(null, null);
		}
	)
};

function authUser(username, password, callback) {
	const query = pool.query('SELECT id, username FROM users\
		WHERE username = $1\
		AND password = crypt($2, password)', [username, password],
		(err, results) => {
			if (err) return callback(err, null);
			if (results.rowCount > 0) return callback(null, true);
			return callback(null, false);
		}
	)
};

module.exports = {checkUser, authUser};
