window.TCWidgetForm = {
    overlayNode: null,
    init: function(params) {
        requirejs.config({
            baseUrl: './js/', 
            paths: {
                lockr: 'bower_components/lockr/lockr',
                classnames: 'lib/classnames'
            }
        });

        requirejs(['config', 'lib/helper', 'lockr', 'classnames'], function(config, h, lockr, cn) {
            if (!params.apikey) {
                throw new Error('Api key is required');
            } else {
                lockr.prefix = config.prefix + params.apikey;
                cn.prefix = config.prefix;
            }
            if (!params.container) {
                throw new Error('Container is required');
            }

            //add passed params to config
            config.setParams({
                apikey: params.apikey,
                container: params.container
            });
            if (params.sa) {
              config.setParam('sa', params.sa);
            }
            if (params.scriptPlace) {
              config.setParam('scriptPlace', params.scriptPlace);
            }
            if (params.apiBaseUrl) {
              config.setParam('apiBaseUrl', params.apiBaseUrl); 
            }
            if (params.redirectUrl) {
              config.setParam('redirectUrl', params.redirectUrl);
            }

            h.loadCss(config.mainCss);
            h.loadCss('https://fonts.googleapis.com/icon?family=Material+Icons');

            requirejs.config({
                baseUrl: './js/', 
                paths: {
                    isMobile: 'bower_components/isMobile/isMobile',
                    lodash: 'bower_components/lodash/lodash',
                    validate: 'bower_components/validate/validate',
                    moment: 'bower_components/moment/moment',
                    dispatcher: 'lib/dispatcher',
                    ajax: 'lib/ajax',
                    react: 'bower_components/react/react',
                    reactDOM: 'bower_components/react/react-dom',
                    microEvent: 'bower_components/microevent/microevent',
                    promise: 'bower_components/es6-promise-polyfill/promise',
                    load: 'loader',
                    stripe: 'https://js.stripe.com/v2/stripe'
                }
            });

            requirejs([
                'react',
                'reactDOM',
                'load!components/wrapper',
                'load!actions/act',
                // 'load!components/overlay',
                'classnames',
                'actions/api'],
            function(
                React,
                ReactDOM,
                Wrapper,
                Act,
                // Overlay,
                cn,
                Api
            ) {

                var render = function() {
                    var container = document.getElementById(params.container);

                    ReactDOM.unmountComponentAtNode(container); // needed if init has been called again

                    ReactDOM.render(
                        React.createElement(Wrapper),
                        container
                    );
                };

                render();

                if (!config.sessionId) {
                    Api.setSession().then(function(sessionId) {
                        config.setParam('sessionId', sessionId);
                        Act.init();
                    });
                } else {
                    Act.init();
                }
            });
        });
    }
};