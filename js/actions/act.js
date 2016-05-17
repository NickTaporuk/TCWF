define([
    'dispatcher',
    'promise',
    'load!stores/store',
    'load!stores/popupStore',
    'actions/api',
    'lib/helper',
    'lib/history',
    'lodash',
    'config'
], function(
    dispatcher,
    Promise,
    store,
    popupStore,
    Api,
    h,
    history,  // history must be used to fill appStore
    _,
    config
) {

    var actions = {
        init: function () {
            start();
        },
        route: function(url, params, changeUrl) {
            params = params || null;
            changeUrl = changeUrl === undefined ? true : changeUrl;

            dispatcher.dispatch({
                actionType: 'page.update',
                page: url,
                props: params
            });

            if (changeUrl) {
                setUrl(url, params);
            }
        },

        popup: {
            
            show: function(title, content, name) {
                dispatcher.dispatch({
                    actionType: 'popup.show',
                    name: name || '',
                    title: title,
                    content: content
                });
            },
            close: function () {
                dispatcher.dispatch({
                    actionType: 'popup.close'
                });
            }

        }
    };

    var visitedPages = {};

    function setUrl(page, params) {
        visitedPages[page] = params || true;

        var path = '#!' + page + (params && Object.keys(params).length > 0 ? '?' + h.objToQuery(params) : '');

        var state = {
            page: page,
            params: params,
            path: path
        };

        if (!history.state || (history.state && history.state.page && history.state.page == page)) {
            history.replaceState(state, page, path);
        } else {
            history.pushState(state, page, path);
        }
    }

    function execute(page, params, afterNav) {
        actions.route(page, params);
    }

    history.bind('popstate', function (state) {
        var page = state && state.page ? state.page : null,
            params = state && state.params ? state.params : {};

        execute(page, params, true);
    });

    function start() {
        var urlData = h.queryToObj(window.location.hash);
        if (['search', 'results', 'summary'].indexOf(urlData.page) == -1) {
            urlData = {
                page: 'search',
                params: null
            };
        }
        execute(urlData.page, urlData.params, false);
    }

    return actions;
});