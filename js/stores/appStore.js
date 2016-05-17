define([
    'lodash'
], function(
    _
) {
    var pageState = {};
    var pageProps = {};


    var store = {
        getPageState: function (pageComponent) {
            var page = typeof pageComponent == 'string' ? pageComponent : pageComponent.constructor.displayName;
            return pageState[page] ?  _.cloneDeep(pageState[page]) : null;
        },

        getPageProps: function (pageComponent) {
            var page = typeof pageComponent == 'string' ? pageComponent : pageComponent.constructor.displayName;
            return pageProps[page] ? _.cloneDeep(pageProps[page]) : null;
        },

        savePageState: function (pageComponent) {
            pageState[pageComponent.constructor.displayName] = pageComponent.state;
            pageProps[pageComponent.constructor.displayName] = pageComponent.props;
        }
    };

    return store;

});