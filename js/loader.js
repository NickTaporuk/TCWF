define([
	'react',
	'microEvent'
], function(
	React,
	microEvent
) {
	return {
		load: function(name, req, onload, _config) {
			if (_config.isBuild) {
				// used by optimizer:
				var path = name;

		    	req([path], function () {
		    		onload();
		    	});
			} else {

				var path = name;

		    	req([path], function (value) {
					if (name.indexOf('components') === 0) {
						value = React.createClass(value);
					} else if (name.indexOf('stores') === 0) {
						microEvent.mixin(value);
					}

		            onload( value );
		        });
		    }
		}
	};
});