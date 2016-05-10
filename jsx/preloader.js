define([
    'react',
    'config',
    'load!stores/ajaxStore'
], function(
    React,
    config,
    ajaxStore
) {

    return {
        getInitialState: function () {
            return {
                show: true
            }
        },

        componentDidMount: function() {
            ajaxStore.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            ajaxStore.unbind('change', this._updateState);
        },

        render: function() {
            if (!this.state.show) {
                return null;
            }

            //https://app.tireconnect.ca/loader/images/animation.gif
            var img = config.imagesFolder + 'loader.gif';
            return <div style={{minHeight: '66px', display: 'block', background: 'url("'+img+'") 50% 50% no-repeat rgb(255, 255, 255)'}} />;
        },

        _updateState: function() {
            var show = ajaxStore.getFinishCount() == 0;
            if (!show) {
                ajaxStore.unbind('change', this._updateState);
            }

            this.setState({
                show: show
            });
        }
    }
});