const express = require('express');
const { Pool } = require('pg');
const path = require('path');

var router = express.Router();

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

router.get('/v1/transactions', (req, res, next) => {
	const results = [];

	var today = new Date();
	var fromDate = new Date(2000, 1, 1);
	var toDate = new Date(today.getFullYear(), today.getMonth()+1, 1);

	if (req.query.from) {
		fromDate = new Date(req.query.from);
	}

	if (req.query.to) {
		// Here's where I realize that JavaScript doesn't just
		// suck with dates... they were literally an afterthought
		toDate = new Date(req.query.to);
		//toDate.setHours(23);
		//toDate.setMinutes(59);
		//toDate.setSeconds(59);
		//toDate.setMilliseconds(999);
		console.log(toDate);
	}

	const query = pool.query('SELECT * FROM transactions t JOIN gasboy_errors e\
		ON t.error_id = e.id\
		WHERE trans_date >= $1 AND trans_date < $2\
		ORDER BY trans_date, trans_num',
		[fromDate, toDate],                  
		(err, queryRes) => {
		if (err) return next(err);
		return res.json(queryRes.rows);
	});
});

module.exports = router;
