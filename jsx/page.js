define([
    'reactDOM',
    'lib/helper',
    'load!components/page/search',
    'load!components/page/results',
    'load!components/page/summary',
    'load!components/page/quoteForm',
    'load!components/page/order',
    'load!components/page/confirmation',
    'load!components/page/quote',
    'load!components/page/emailForm',
    'react',
    'load!stores/store',
    'classnames',
    'config',
    'lodash'
], function(
    ReactDOM,
    h,
    Search,
    Results,
    Summary,
    QuoteForm,
    Order,
    Confirmation,
    Quote,
    EmailForm,
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
                name: '',
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
            var content = null;

            var props = store.getProps();
            switch (this.state.name) {
                case 'search':
                    content = <Search {...props} />;
                    break;
                case 'results':
                    content = <Results {...props} />;
                    break;
                case 'summary':
                    content = <Summary {...props} />;
                    break;
                case 'quote_form':
                    content = <QuoteForm {...props} />;
                    break;
                case 'email_form':
                    content = <EmailForm {...props} />;
                    break;
                case 'get_a_quote':
                    content = <Quote {...props} />;
                    break;
                case 'order':
                    content = <Order {...props} />;
                    break;
                case 'confirmation':
                    content = <Confirmation {...props} />;
                    break;

                case '':
                    content = null;
                    break;
            }

            return content;
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
    }

    return Page;
});