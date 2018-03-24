const { Pool } = require('pg');
const fs = require('fs');
const es = require('event-stream');

if (process.argv.length < 3 || process.argv[2] === '') {
	console.log('Please pass gaslog file as first parameter');
	return;
}
	
console.log(process.argv[2]);

var logStream = fs.createReadStream(process.argv[2])
	.pipe(es.split())
	.pipe(es.mapSync(handleLine))
	.on('error', function(err) {
		console.log('Error:', err);
	})
	.on('end', function(err) {
		console.log('Finished reading');
	})


const pool = new Pool();

function insertTrans(trans) {
	pool.query(
		'INSERT INTO transactions\
		(trans_num\
		,card_num\
		,veh_num\
		,emp_num\
		,trans_date\
		,pump_num\
		,prod_num\
		,qty\
		,price\
		,total\
		,odom\
		,error_id)\
		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,\
		(SELECT id FROM gasboy_errors WHERE error_text=$12))',
		trans, queryReturn);
}

function allDigits(field) {
	const check = /^\d{4}$/;
	if (check.test(field)) 
		return field;

	return '0000';
}

function handleLine(line) {
	logStream.pause();
	if (line.length < 73) {
		console.log('Line too short: ', line);
		return
	}

	var fields = line.split(' ').filter(n => n);

	var trans = {
		trans_num: allDigits(fields[0]),
		card_num: allDigits(fields[1]),
		veh_num: allDigits(fields[2]),
		emp_num: allDigits(fields[3]),
		trans_date: fields[4] + ' ' + fields[5],
		pump_num: fields[6],
		prod_num: fields[7],
		qty: fields[8].replace('.',''),
		price: fields[9].replace('.',''),
		total: fields[10].replace('.',''),
		odom: fields[11],
		error: 'NONE'
	}

	if (fields.length > 12) {
		trans.error = line.substr(74);
	}

	console.log(line);
	insertTrans(Object.values(trans));
	//console.log(trans);
	logStream.resume();
}


function queryReturn(err, res) {
	if (err) {
		console.log(err.stack);
	} else {
		console.log(res);
	}
}

function queryReturnEnd(err, res) {
	queryReturn(err, res);
	pool.end();
}

