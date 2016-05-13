define(['config', 'promise'], function(config, Promise) {
	function Ajax() {
		var $public = {};
		var $private = {};

		$private.methods = {
		  done: function() {},
		  error: function() {},
		  always: function() {}
		};

		$public.get = function get( url, data ) {
		  var data = $private.objectToQueryString( data );
		  url += (url.indexOf('?') === -1 ? '?' : '&') + data;
		  return $private.XHRConnection( 'GET', url );
		};

		$public.post = function post( url, data ) {
		  return $private.XHRConnection( 'POST', url, data );
		};

		$public.put = function put( url, data ) {
		  return $private.XHRConnection( 'PUT', url, data );
		};

		$public.delete = function del( url, data ) {
		  return $private.XHRConnection( 'DELETE', url, data );
		};

		$private.XHRConnection = function XHRConnection( type, url, data ) {
			// console.log(("onload" in new XMLHttpRequest()));
		  if (!isIE() || isIE() > 9) {
		    var xhr =  new XMLHttpRequest();  
		    var contentType = 'application/x-www-form-urlencoded';
		    // var contentType = 'text/plain';
		    xhr.open( type, url || '', true );
		    // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
		    xhr.setRequestHeader( 'Content-Type', contentType );
		    xhr.addEventListener( 'readystatechange', $private.ready, false );
		  } else {
		  	if (document.location.protocol !== 'https:') {
		  		url = url.replace('https', 'http');
		  	}
		    var xhr = new XDomainRequest();
		    xhr.open( type, url || '' );
		    xhr.onload = function() {
		      $private.methods.always
		        .apply( $private.methods, $private.parseResponse( xhr ) );
		      $private.methods.done
		        .apply( $private.methods, $private.parseResponse( xhr ) );
		    };
		    xhr.onerror = function() {
		      $private.methods.always
		        .apply( $private.methods, $private.parseResponse( xhr ) );
		      $private.methods.error
		        .apply( $private.methods, $private.parseResponse( xhr ) );
		    };
		    xhr.ontimeout = function () { };
			xhr.onprogress = function () { };
		  }
		  xhr.send( $private.objectToQueryString( data ) );
		  return $private.promises();
		};

		$private.ready = function ready() {
		  var xhr = this;
		  var DONE = 4;
		  if( xhr.readyState === DONE ) {
		    xhr.removeEventListener( 'readystatechange', $private.ready, false );
		    $private.methods.always
		      .apply( $private.methods, $private.parseResponse( xhr ) );
		    if( xhr.status >= 200 && xhr.status < 300 ) {
		      return $private.methods.done
		        .apply( $private.methods, $private.parseResponse( xhr ) );
		    }
		    $private.methods.error
		      .apply( $private.methods, $private.parseResponse( xhr ) );
		  }
		};

		$private.parseResponse = function parseResponse( xhr ) {
		  var result;
		  try { result = JSON.parse( xhr.responseText ); }
		  catch( e ) { result = xhr.responseText; }
		  return [ result, xhr ];
		};

		$private.promises = function promises() {
		  var allPromises = {};
		  Object.keys( $private.methods ).forEach(function( promise ) {
		    allPromises[ promise ] = $private.generatePromise.call( this, promise );
		  }, this );
		  return allPromises;
		};

		$private.generatePromise = function generatePromise( method ) {
		  return function( callback ) {
		    return ( $private.methods[ method ] = callback, this );
		  };
		};

		$private.objectToQueryString = function objectToQueryString( data ) {
		  return $private.isObject( data )
		    ? $private.getQueryString( data )
		    : data;
		};

		$private.getQueryString = function getQueryString(obj, prefix) {
		  var str = [];
		  for(var p in obj) {
		    if (obj.hasOwnProperty(p)) {
		      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
		      str.push(typeof v == "object" ?
		        $private.getQueryString(v, k) :
		        encodeURIComponent(k) + "=" + encodeURIComponent(v));
		    }
		  }
		  return str.join("&");
		};

		$private.isObject = function isObject( data ) {
		  return '[object Object]' === Object.prototype.toString.call( data );
		};

		return $public;
	}

	var isIE = function () {
	  var myNav = navigator.userAgent.toLowerCase();
	  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
	};

	var widgetAjax = function() {
		var self = this;

		// ---- cache ----
		var cache = {};
		var oneTimeCache = {};

		var getKeyForCache = function(url, data) {
			return (url + JSON.stringify(data)).replace(/[^a-zA-Z0-9]/g, '');
		};

		var addToCache = function(url, data, response) {
			cache[getKeyForCache(url, data)] = response;
		};

		var getFromCache = function(url, data) {
			var response = cache[getKeyForCache(url, data)]; 
			return response || null;
		};

		var addToOneTimeCache = function(url, data, response) {
			oneTimeCache[url] = {
				key: getKeyForCache(url, data),
				response: response
			};
		};

		var getFromOneTimeCache = function(url, data) {
			return oneTimeCache[url] && oneTimeCache[url].key == getKeyForCache(url, data) ? oneTimeCache[url].response : null;
		};
		// ---- END cache ----

		var ajaxCounter = 0;

		this.beforeSend = function(){};
		this.error = function(e){};  
		this.complete = function(){};

	
		this.isBusy = function() {
			return ajaxCounter > 0;
		};

		this.make = function(params) {
			var url = config.apiBaseUrl + params.url + (/\?/.test(params.url) ? '&' : '?') + 'key=' + config.apikey + (config.sessionId ? '&session_id=' + config.sessionId : '');
			var a;

			self.beforeSend();
			ajaxCounter++;

			var ajax_a = new Ajax();

			var useGlobalError = params.useGlobalError !== undefined ? params.useGlobalError : true;

			var error = function(response, xhrObject) {
				params.error ? params.error(response, xhrObject) : self.error(response, xhrObject);
			};

			var always = function(response, xhrObject) {
				ajaxCounter--;
				params.complete ? params.complete(response, xhrObject) : self.complete(response, xhrObject);
			};
			console.log('params:',params);

			return new Promise(function(resolve, reject) {
				
				var data = params.data || {};

				var responseFromCache = '';
				if (params.oneTimeCache) {
					responseFromCache = getFromOneTimeCache(url, data);
				} else if (params.cache) {
					responseFromCache = getFromCache(url, data);

				}
				if (responseFromCache) {
					resolve(responseFromCache);
					always(responseFromCache);
					return;
				}

				switch (params.method || 'get') {
					case 'get':
						a = ajax_a.get( url, data );
						break;
					case 'post':
						a =ajax_a.post( url, data );
						break;
				}

				a.done(function(response, xhr) {
					if (params.oneTimeCache) {
						addToOneTimeCache(url, data, response);
					} else if (params.cache) {
						addToCache(url, data, response);
					}

					resolve(response, xhr);
				});

				a.error(function(response, xhrObject) {
					if (useGlobalError) {
						error(response, xhrObject);
					} else {
						reject(response, xhrObject);
					}
				});

				a.always(always);

			});
		}
	}

	return new widgetAjax();
});