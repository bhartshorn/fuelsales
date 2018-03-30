function getTransactions(startdate, enddate) {
	var query = $("#filter").serialize();
	var table = $('#transactions').DataTable();
	table.ajax.url('/api/v1/transactions?' + query).load();
	console.log('/api/v1/transactions?' + query);
}
$(document).ready( () => {
	$("#filter").change(getTransactions);
	$('#transactions').DataTable( {
		ajax: {
			url: "/api/v1/transactions?",
			dataSrc: ''
		},
		columns: [
			{ data: 'trans_num' },
			{ 
				data: 'trans_date',
				render: function ( data, type, row ) {
					if (type !== "display" && type !== "filter") {
						return data;
					};
					c = ':';
					dateTime = data.split("T");
					time = dateTime[1].split(":");
					return dateTime[0] + ' ' + time[0] + c + time[1];
				}
			},
			{ data: 'prod_num' },
			{ data: 'price' },
			{ data: 'total' },
			{ data: 'error_text' },
			{ data: 'card_num' }
		]
	});
});
