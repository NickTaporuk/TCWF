define([
    'reactDOM',
    'lib/helper',
    'load!components/page/search',
    'react',
    'load!stores/store',
    'classnames',
    'config',
    'lodash'
], function(
    ReactDOM,
    h,
    Search,
    React,
    store,
    cn,
    config,
    _
) {

    var Page = {
        displayName: 'page',

        getInitialState: function() {
            return {
                name: 'search',
                props: {}
            }
        },

        componentWillMount: function() {
            this._updateState();
        },

        componentDidMount: function() {
            store.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            store.unbind('change', this._updateState);
        },

        componentDidUpdate: function() {
            if (this.state.props.lastScrollPos) {
                window.scrollTo(0, this.state.props.lastScrollPos);
            } else {
                this._scrollToTop();
            }
        },

        render: function() {
            return this._getContent();
        },

        _getContent: function() {
            var props = store.getProps();

            return <Search {...props} />;
        },

        _updateState: function () {
            this.setState({
                name: store.getPage()
            });
        },

        _scrollToTop: function() {
            var widget = document.getElementById(cn('widget'));
            h.scrollToTop(widget);
        }
    };

    return Page;
});