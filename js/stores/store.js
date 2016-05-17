define([
    'dispatcher',
    'lodash'
], function(
    dispatcher,
    _
) {
    var appState = {
        page: '',

        props: {}
    };


    var store = {
        getPage: function () {
            return appState.page;
        },

        getProps: function (page) {
            page =  page || appState.page;
            return appState.props[page] ? appState.props[page] : null;
        },

        getProp: function(prop, page) {
            page =  page || appState.page;
            return appState.props[page] && appState.props[prop] ? appState.props[page][prop] : null;
        },

        dispatchToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {
                case 'page.update':
                    appState.page = payload.page;
                    appState.props[payload.page] = payload.props;
                    break;
            }

            store.trigger('change');
        })
    }

    return store;

});