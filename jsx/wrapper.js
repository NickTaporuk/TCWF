define([
    'react',
    'reactDOM',
    'classnames', 
    'config',
    'load!components/page/search'
], function(
    React,
    ReactDOM,
    cn, 
    config,
    Search
) {

    return {
        displayName: 'Wrapper',

        componentDidMount: function() {
            this._checkContainerWidth();
            if (window.addEventListener) {
              window.addEventListener('resize', this._checkContainerWidth, false);
            } else {
              window.attachEvent('onresize', this._checkContainerWidth);
            }
        },

        render: function() {
            return (
                <div id={cn('widget')}>
                    <div className={cn('wrapper')}>
                        <Search />
                    </div>
                </div>
            );
        },

        _checkContainerWidth: function() {
            var el = ReactDOM.findDOMNode(this);
            var tireconnect = el.parentElement,
                tireconnectWidth = tireconnect.offsetWidth;

            if (tireconnectWidth >= 1024) {
                tireconnect.setAttribute('data-tcwlw-w', 't s m l');
            } else if (tireconnectWidth < 1024 && tireconnectWidth >= 768) {
                tireconnect.setAttribute('data-tcwlw-w', 't s m');
            } else if (tireconnectWidth < 768 && tireconnectWidth >= 600) {
                tireconnect.setAttribute('data-tcwlw-w', 't s');
            } else {
                tireconnect.setAttribute('data-tcwlw-w', 't');
            }
        }
    };

});