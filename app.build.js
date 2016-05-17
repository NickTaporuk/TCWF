({
	baseUrl: "./js",
	// mainConfigFile: "build_config.js",
	name: "bower_components/almond/almond",
	// name: "bower_components/requirejs/require",
	include: ['app'],
	findNestedDependencies: true,
	// optimize: "none",
	optimize: 'uglify2',
	preserveLicenseComments: false,
	out: "js/widget.js",
	wrap: {
        start: "(function() {",
        end: "}());"
    },
	paths: {
	  'isMobile': 'bower_components/isMobile/isMobile',
	  'moment': 'bower_components/moment/moment',
	  'react': 'bower_components/react/react',
	  'reactDOM': 'bower_components/react/react-dom',
	  'microEvent': 'bower_components/microevent/microevent',
	  'promise': 'bower_components/es6-promise-polyfill/promise',
	  'validate': 'bower_components/validate/validate',
	  'lodash': 'bower_components/lodash/lodash',
	  'lockr': 'bower_components/lockr/lockr',
	  'stripe': 'empty:',
	  'dispatcher': 'lib/dispatcher',
	  'classnames': 'lib/classnames',
	  'ajax': 'lib/ajax',
	  'load': 'loader'
	}
})