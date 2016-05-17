define([
    'dispatcher',
    'load!actions/constants'
], function(
    dispatcher,
    constants
) {

    var ajaxCount = 0;
    var finishCount = 0;

    var ajaxStore = {
        isInProcess: function() {
            return ajaxCount > 0;
        },

        getFinishCount: function() {
            return finishCount;
        },

        dispatchToken: dispatcher.ajax.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case constants.BEFORE_REQUEST:
                    ajaxCount++;
                    change = true;
                    break;
                    
                case constants.RESPONSE_RECEIVED: 
                    ajaxCount--;
                    if (ajaxCount === 0) {
                        finishCount++;
                        change = true;
                    }
                    break;
            }
            
            if (change) {
                ajaxStore.trigger('change');
            }
        })
    };

    return ajaxStore;
});