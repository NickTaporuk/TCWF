var params = {
    api: false, // if true api from server will be used
    assets: false, // if true assets from server will be used
    live: false, // if true live server will be used, otherwise dev server will be used
    sa: false, // if true will be loaded in store version
    optim: false // if true optimized/minified js will be used
};

// update params base on url
var urlParams = window.location.search.replace('?', '').split('&');
var urlParamsLength = urlParams.length;
for (var i = 0; i < urlParamsLength; i++) {
    params[urlParams[i]] = true;
}

requirejs.config({
    baseUrl: './js/',
    paths: {
        lodash          : 'bower_components/lodash/lodash',
        baseParams      : 'env/localParamsBase',
        env             : 'env/localParams',
    }
});

requirejs(['lodash','baseParams','env',(params.optim ? (params.scriptPlace + '/js/widget.js') : 'app')],function (_) {

    var environ;
    if(!!localParams) {
        environ = _.assign(params,localParams)
    } else {
        environ = params
    }

    TCWidgetForm.init({
        apikey        : environ.apikey,
        container     : 'content',
        sa            : environ.sa,
        scriptPlace   : environ.scriptPlace,
        apiBaseUrl    : environ.apiBaseUrl,
        redirectUrl   : 'www.tireconnect.ca/new-tireconnect-demo/',
        locationState : 'auto' // 2 state manual and auto
        // locationState : 'manual' // 2 state manual and auto
    });
});