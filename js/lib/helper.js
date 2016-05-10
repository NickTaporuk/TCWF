define(['config'], function(config) {
	var h = {
		priceFormat: function(_number,_decimal,_separator)
		{
		  var decimal = (typeof(_decimal) != 'undefined') ? _decimal : 2;

		  var separator = (typeof(_separator) != 'undefined') ? _separator : '';

		  var r = parseFloat(_number);

		  var exp10 = Math.pow(10, decimal);
		  r = Math.round(r * exp10) / exp10;

		  var rr = Number(r).toFixed(decimal).toString().split('.');

		  var b = rr[0].replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g,"\$1" + separator);
		  r = b + '.' + rr[1];

		  return r;
		},
		printHtml: function(html, cssUrls)
		{
	        var printWindow = window.open('', 'Print', 'left=0,top=0,width=800,height=800,toolbar=0,scrollbars=0,status=0');
	        var htmlPage = '<html><head><title>Print</title>';


	        printWindow.document.write('<html><head><title>Print</title>');
	        if (cssUrls) {
	        	cssUrls.map(function(url){
	        		htmlPage += '<link rel="stylesheet" href="' + url + '" type="text/css" />';
	        	});
	       	}
	       	htmlPage += '</head><body>' + html + '</body></html>';
	        printWindow.document.write(htmlPage);

        	printWindow.document.close(); // necessary for IE >= 10
        	printWindow.focus(); // necessary for IE >= 10

	        // console.log(printWindow.document.readyState);
	        if (printWindow.document.readyState == 'complete') {
	        	// console.log('ready');
        		printWindow.print();
	        	printWindow.close();	        	
	        } else {
		        printWindow.onload = function() {
		        	// console.log('load');
	        		printWindow.print();
		        	printWindow.close();
		        };
		    }

	        return true;
	    },
	    loadCss: function(url) {
          var link = document.createElement("link");
          link.type = "text/css";
          link.rel = "stylesheet";
          link.href = url;
          document.getElementsByTagName("head")[0].appendChild(link);
        },
        getOffset: function(elem) {
	    	// (1)
		    var box = elem.getBoundingClientRect();
		    
		    // (2)
		    var body = document.body;
		    var docElem = document.documentElement;
		    
		    // (3)
		    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
		    
		    // (4)
		    var clientTop = docElem.clientTop || body.clientTop || 0;
		    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
		    
		    // (5)
		    var top  = box.top +  scrollTop - clientTop;
		    var left = box.left + scrollLeft - clientLeft;
		    
		    return { top: Math.round(top), left: Math.round(left) };
		},
		getScrollPos: function() {
			if(window.pageYOffset !== undefined) {
			 	return [pageXOffset, pageYOffset];
			} else {
			 	var sx, sy, d= document, r= d.documentElement, b= d.body;
			 	sx= r.scrollLeft || b.scrollLeft || 0;
			 	sy= r.scrollTop || b.scrollTop || 0;
			 	return [sx, sy];
			}
		},
		scrollToTop: function(el, force) {
            var scrollPos = h.getScrollPos();
            var offset = h.getOffset(el);

            if (window.scrollParentPageTo) {
            	// if widget in iframe
            	window.scrollParentPageTo(offset.top);           	
            } else if (scrollPos[1] > offset.top || force) {
                var winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                var scrollToY = offset.top - winHeight/8;
                window.scrollTo(0, scrollToY);
            }
        },
        queryToObj: function(query) {
            var paramFromString = function(string, val, obj) {
                if (!obj) {
                    obj = {};
                }
                var arr = string.match(/([^\[]+)\[([^\]]+)\]/);
                if (arr) {
                    // if parameter is array:
                    string = string.replace(arr[1], '').replace('[', '').replace(']', '');

                    if ( /[^\[]+/.test(string) ) {
                        obj[arr[1]] = paramFromString(string, val, obj[arr[1]]);
                    }
                } else {
                    obj[string] = isNaN(parseInt(val)) ? val : val * 1;
                }
                return obj;
            };

            var i = 0,
                retObj = {},
                pair = null,
                parts = query.match(/^([^\?]*)(\?)?(.*)$/),
                params = parts[3],
                page = parts[1].replace('#!', ''),
                qArr = params ? params.split('&') : [];

            if (params) {
                for (i = 0; i < qArr.length; i++) {
                    pair = qArr[i].split('=');

                    var paramName = decodeURIComponent(pair[0]);
                    paramFromString(paramName, decodeURIComponent(pair[1]), retObj);
                }
            } else {
                retObj = null;
            }
         
            return {
                page: page,
                params: retObj
            };
        },
        objToQuery: function(obj, prefix) {
            var str = [];
            for(var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    var param = typeof v == "object" ?
                        h.objToQuery(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v);
                    if (param) {
                        str.push(param);
                    }
                }
            }

            return str.join("&");
        },
		base64Decode: function ( data ) {
			var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var o1, o2, o3, h1, h2, h3, h4, bits, i=0, enc='';

			do {  // unpack four hexets into three octets using index points in b64
				h1 = b64.indexOf(data.charAt(i++));
				h2 = b64.indexOf(data.charAt(i++));
				h3 = b64.indexOf(data.charAt(i++));
				h4 = b64.indexOf(data.charAt(i++));

				bits = h1<<18 | h2<<12 | h3<<6 | h4;

				o1 = bits>>16 & 0xff;
				o2 = bits>>8 & 0xff;
				o3 = bits & 0xff;

				if (h3 == 64)	  enc += String.fromCharCode(o1);
				else if (h4 == 64) enc += String.fromCharCode(o1, o2);
				else			   enc += String.fromCharCode(o1, o2, o3);
			} while (i < data.length);

			return enc;
		}

};

	return h;
});