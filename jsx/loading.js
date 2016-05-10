define([
    'react',
    'classnames', 
    'load!stores/ajaxStore',
    'config'
], function(
    React,
    cn,
    ajaxStore,
    config
) {
    return {
        displayName: 'Loading',

        getInitialState: function() {
            return  {
                loader: true
            }
        },

        componentWillMount: function() {
            this._updateStatus();
        },
        componentDidMount: function() {
            ajaxStore.bind('change', this._updateStatus);
        },
        componentWillUnmount: function() {
            ajaxStore.unbind('change', this._updateStatus);    
        },

        render: function() {
            return (
                <div className={cn('loader')} style={ {display: this.state.loader ? 'block' : 'none' } }>
                    <img src={config.imagesFolder + 'loader.gif'} alt="Loading" />
                </div>
            )
        },

        _updateStatus: function() {
            this.setState({
                loader: ajaxStore.isInProcess() &&  ajaxStore.getFinishCount() > 0
            });
        }

    }


});