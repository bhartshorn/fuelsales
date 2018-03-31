var fileSaver = require('file-saver');

function getTransactions(startdate, enddate) {
	var query = $("#filter").serialize();
	var table = $('#transactions').DataTable();
	table.ajax.url('/api/v1/transactions?' + query).load();
	console.log('/api/v1/transactions?' + query);
}

function createGaslog(transactions, callback) {
	var fileString = '';
	var n = '\n';
	var s = ' ';
	transactions.forEach((t) => {
		var trans_err = ''

		if (t.error_id !== 0) {
			trans_err = s + t.error_text 
		}

		fileString += padInt(t.trans_num, 4) + s
		+ padInt(t.card_num, 4) + s
		+ padInt(t.veh_num, 4) + s
		+ padInt(t.emp_num, 4) + s
		+ padInt(t.pump_num, 2) + s
		+ padInt(t.prod_num, 2) + s
		+ formatDec(t.qty, 1).padStart(7) + s
		+ formatDec(t.price, 3).padStart(7) + s
		+ formatDec(t.total, 2).padStart(9) + s
		+ padInt(t.odom, 6)
		+ trans_err
		+ n;
	});

	return callback(fileString);
}
function formatDec(num, precision) {
	var cents = String(num)
	return cents.slice(0, -precision) + '.' + cents.slice(-precision);
}

function padInt(num, width) {
	return String(num).padStart(width, '0');
}

function downloadGaslog(fileString) {
	var gaslogBlob = new Blob([fileString], {
		type: "text/plain;charset=utf-8"
	});

	fileSaver.saveAs(gaslogBlob, 'gaslog.txt');
}

function createDisplayDate(dateString) {
	c = ':';
	dateTime = dateString.split("T");
	time = dateTime[1].split(":");
	return dateTime[0] + ' ' + time[0] + c + time[1];
}

$(document).ready( () => {
	table = $('#transactions').DataTable( {
		ajax: {
			url: "/api/v1/transactions?",
			dataSrc: ''
		},
		columns: [
			{ 
				data: 'trans_date',
				render: function ( data, type, row ) {
					if (type !== "display" && type !== "filter") {
						return data;
					};
					return createDisplayDate(data);
				}
			},
			{ data: 'trans_num' },
			{ 
				data: 'card_num',
				render: function (data, type, row ) {
					if (type !== "display" && type !== "filter") {
						return data;
					};
					return padInt(data, 4);
				}
			},
			{ data: 'prod_num' },
			{ 
				data: 'qty',
				render: function (data, type, row ) {
					if (type !== "display" && type !== "filter") {
						return data;
					};
					return formatDec(data, 1);
				}
			},
			{ data: 'error_text' }
		]
	});

	$("#filter").change(getTransactions);
	$("#download").click(() => {
		transactions = table.ajax.json();
		createGaslog(transactions, downloadGaslog)
	});
});
