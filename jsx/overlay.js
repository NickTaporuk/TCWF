define([
    'react',
    'classnames', 
    'load!stores/ajaxStore',
    'load!components/popup',
    'load!components/loading',
    'config'
], function(
    React,
    cn,
    ajaxStore,
    Popup,
    Loading,
    config
) {
    return {
        displayName: 'Overlay',

        render: function() {
            return (
                <div>
                    <Loading />
                    <Popup />
                </div>
            )
        }
    }


});