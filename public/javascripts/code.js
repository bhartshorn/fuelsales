(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.2
 * 2016-06-16 18:25:19
 *
 * By Eli Grey, http://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */

/*global self */
/*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

var saveAs = saveAs || (function(view) {
	"use strict";
	// IE <10 is explicitly unsupported
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, throw_outside = function(ex) {
			(view.setImmediate || view.setTimeout)(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
			event_types = [].concat(event_types);
			var i = event_types.length;
			while (i--) {
				var listener = filesaver["on" + event_types[i]];
				if (typeof listener === "function") {
					try {
						listener.call(filesaver, event || filesaver);
					} catch (ex) {
						throw_outside(ex);
					}
				}
			}
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
							filesaver.readyState = filesaver.DONE;
							dispatch_all();
						};
						reader.readAsDataURL(blob);
						filesaver.readyState = filesaver.INIT;
						return;
					}
					// don't create more object URLs than needed
					if (!object_url) {
						object_url = get_URL().createObjectURL(blob);
					}
					if (force) {
						view.location.href = object_url;
					} else {
						var opened = view.open(object_url, "_blank");
						if (!opened) {
							// Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
							view.location.href = object_url;
						}
					}
					filesaver.readyState = filesaver.DONE;
					dispatch_all();
					revoke(object_url);
				}
			;
			filesaver.readyState = filesaver.INIT;

			if (can_use_save_link) {
				object_url = get_URL().createObjectURL(blob);
				setTimeout(function() {
					save_link.href = object_url;
					save_link.download = name;
					click(save_link);
					dispatch_all();
					revoke(object_url);
					filesaver.readyState = filesaver.DONE;
				});
				return;
			}

			fs_error();
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		}
	;
	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	FS_proto.abort = function(){};
	FS_proto.readyState = FS_proto.INIT = 0;
	FS_proto.WRITING = 1;
	FS_proto.DONE = 2;

	FS_proto.error =
	FS_proto.onwritestart =
	FS_proto.onprogress =
	FS_proto.onwrite =
	FS_proto.onabort =
	FS_proto.onerror =
	FS_proto.onwriteend =
		null;

	return saveAs;
}(
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| this.content
));
// `self` is undefined in Firefox for Android content script context
// while `this` is nsIContentFrameMessageManager
// with an attribute `content` that corresponds to the window

if (typeof module !== "undefined" && module.exports) {
  module.exports.saveAs = saveAs;
} else if ((typeof define !== "undefined" && define !== null) && (define.amd !== null)) {
  define("FileSaver.js", function() {
    return saveAs;
  });
}

},{}],2:[function(require,module,exports){
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
	//TODO: check if number is big enough, add leading zero if not!
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
		dom: 'lrtip',
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
	$("#search").on( 'keyup', function () {
		console.log('Searching for: ', this.value);
		table.search( this.value ).draw();
	});
	$("#download").click(() => {
		transactions = table.ajax.json();
		createGaslog(transactions, downloadGaslog)
	});
});

},{"file-saver":1}]},{},[2]);
