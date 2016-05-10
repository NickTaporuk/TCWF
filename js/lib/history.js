define([
    'microEvent',
    'config'
], function(
    microEvent,
    config
) {
    if (history.pushState && config.allowUrl) {
        // if browser support history API

        window.addEventListener('popstate', function(e) {
            history.trigger('popstate', e.state ? e.state : null);
        }, false);

        microEvent.mixin(history);

        return history;

    } else {

        function hist(params) {
            var currentPos = 0;
            var list = [];

            this.state = null;

            this.pushState = function(state, title, url) {
                list.splice((currentPos+1), list.length-(currentPos+1), {
                    state: state,
                    title: title,
                    url: url
                });
                currentPos = list.length - 1;
                this.state = state;

                // console.log('push', list.length, currentPos);
            };

            this.replaceState = function(state, title, url) {
                list[currentPos] = {
                    state: state,
                    title: title,
                    url: url
                };
                this.state = state;

                // console.log('replace', list.length, currentPos);
            };

            this.back = function() {
                if (currentPos > 0) {
                    currentPos--;
                    this.state = list[currentPos].state;

                    this.trigger('popstate', list[currentPos].state);
                }

                // console.log('back', list.length, currentPos);
                return false;
            };

            this.forward = function() {
                if (list.length > (currentPos+1)) {
                    currentPos++;
                    this.state = list[currentPos].state;

                    this.trigger('popstate', list[currentPos].state);
                }

                // console.log('forward', list.length, currentPos);
                return false;
            };
        }

        microEvent.mixin(hist);

        return new hist();
    }
});