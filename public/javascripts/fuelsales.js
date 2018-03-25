$(document).ready( function() {
	$.getJSON('/api/v1/transactions', function(results) {
		$('#transactions').DataTable({
			data: results,
			columns: [
				{ data: 'trans_num' },
				{ data: 'trans_date' },
				{ data: 'prod_num' },
				{ data: 'price' },
				{ data: 'total' },
				{ data: 'error_text' },
				{ data: 'card_num' }
			]
		});
	});
});
