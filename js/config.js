define([
    'lockr'
], function(
    lockr
) {

    var isSessionIdSetted = function() {
        // true if last sesstion id was created less than "expireAfter" days ago.
        var lastSesstionId = lockr.get('sessionId');
        var expireAfter = 1000*60*60*24*3; // 3 days in milliseconds
        return (lastSesstionId && (Date.now() - lockr.get('sessionIdCreatedAt')) < expireAfter);
    };

    var isReturnedUser = function() {
        return lockr.get('sessionId') ? true : false;
    };
    
    var config = {
        prefix: 'tcwlw_',
        allowUrl: true,
        apikey: null,
        sessionId: null,
        isReturnedUser: null,
        sa: false,
        wlUrl: 'https://wl.tireconnect.ca',
        apiBaseUrl:  'https://wl.tireconnect.ca/api/v1/',

        // methods to change params
        setParam: function(param, value) {
            config[param] = value;
            switch (param) {
                case 'apikey':
                    config.sessionId = isSessionIdSetted() ? lockr.get('sessionId') : null;
                    config.isReturnedUser = isReturnedUser();
                    break;
                case 'sessionId':
                    if (!isSessionIdSetted()) {
                        lockr.set('sessionId', value);
                        lockr.set('sessionIdCreatedAt', Date.now());
                    }
                    break;
                case 'scriptPlace':
                    config.imagesFolder = value + '/img/';
                    config.mainCss      = value + '/css/style.css';
                    break;
            }
        },
        setParams: function(params) {
            Object.keys(params).map(function(param){
                config.setParam(param, params[param]);
            });
        },
    };

    var scriptPlace = 'https://app.tireconnect.ca';
    config.setParam('scriptPlace', scriptPlace);

    return config;


});