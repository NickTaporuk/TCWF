define([
    'dispatcher',
    'lodash'
], function(
    dispatcher,
    _
) {
    // var searchStore = {
    //     getState: function () {
    //
    //     },
    //     dispatchToken: dispatcher.register(function(payload) {
    //         switch (payload.actionType) {
    //             case 'search.fields.update':
    //                 break;
    //         }
    //
    //         searchStore.trigger('change');
    //     })
    // };
    //
    // var resultsStore = {
    //     getState: function () {
    //
    //     },
    //     dispatchToken: dispatcher.register(function(payload) {
    //         switch (payload.actionType) {
    //             case 'tire.quantity.change':
    //                 break;
    //         }
    //
    //         resultsStore.trigger('change');
    //     })
    // };
    //
    // var summaryStore = {
    //     getState: function () {
    //
    //     },
    //     dispatchToken: dispatcher.register(function(payload) {
    //         switch (payload.actionType) {
    //             case 'summary.param.change':
    //                 break;
    //         }
    //
    //         summaryStore.trigger('change');
    //     })
    // };
    //
    //
    // var customerStore = {
    //     getCustomer: function () {
    //
    //     },
    //     dispatchToken: dispatcher.register(function(payload) {
    //         switch (payload.actionType) {
    //             case 'customer.param.change':
    //                 break;
    //         }
    //
    //         customerStore.trigger('change');
    //     })
    // };


    var appState = {
        page: '',

        props: {}

        //search: {
            //selected values
        //},

        //results: {
            //tires state
        //},

        //quote: {
            //     tire_id: '',
            //     with_discount: '',
            //     custom_discount: '',
            //     optional_services: ''
        //},

        //customer: {
            //
        //},

        //order: {
            //
        //}

        // props: {                  //last page props saved here
            // results: {
            //     // search params,
            //     filters: {
            //
            //     },
            //     location_id: '',
            //
            //     page_number: 1,
            //
            //     order_by: 'best_mutch',
            //     display: 'full'
            // },
            // quote: {
            //     tire_id: '',
            //     with_discount: '',
            //     custom_discount: '',
            //     optional_services: ''
            // }
        // },

        // params: {                 //needed page states saved here
        //     summary: {
        //         tab: 'by_size'
        //     },
        //     results: {
        //         tires: [
        //             // { tire_id: { quantity: '', supplier: '' }}
        //         ]
        //     },
        //     summary: {
        //         tire_id: '',
        //         with_discount: '',
        //         custom_discount: '',
        //         optional_services: ''
        //     },
        //     customer: {
        //
        //     }
        // },
        //
        // search: {   // all off this is in url params
        //     activeTab: 'by_size',
        //     by_size: {
        //         width: '',
        //         height: '',
        //         rim: '',
        //         load_index: '',
        //         speed_rating: '',
        //         base_category: ''
        //     },
        //
        //     by_vehicle: {
        //         year: '',
        //         make: '',
        //         model: '',
        //         trim: '',
        //         car_tire_id: '',
        //         base_category: ''
        //     },
        //
        //     by_part_number: {
        //         part_number: ''
        //     },
        //
        //     location_id: '',
        //
        //     page_number: 1,
        //
        //     order_by: 'best_mutch',
        //     display: 'full',
        //
        //     filters: {
        //         brands: [],
        //         category: [],
        //         run_flat: [],
        //         light_truck: []
        //     },
        //
        //     tires: {
        //         // tire_id: { quantity: '', supplier: '' }
        //     }
        // },
        //
        // quote: {   // all off this is in url params
        //     quantity: 4,
        //     with_discount: false,
        //     customer_discount: 0,
        //     optional_services: []
        // },
        //
        // customer: {   // used on several pages: quotes and order
        //     name: '',
        //     phone: '',
        //     email: '',
        //     vehicle: {
        //         year: '',
        //         make: '',
        //         model: '',
        //         trim: ''
        //     },
        //     notes: '',
        //     preferred_time: '',
        //     way_to_contact: 'phone',
        //     follow_up: false
        // }
    };


    var store = {
        getPage: function () {
            return appState.page;
        },

        getProps: function (page) {
            page =  page || appState.page;
            return appState.props[page] ? appState.props[page] : null;
        },

        getProp: function(prop, page) {
            page =  page || appState.page;
            return appState.props[page] && appState.props[prop] ? appState.props[page][prop] : null;
        },

        dispatchToken: dispatcher.register(function(payload) {
            // console.log(payload);
            switch (payload.actionType) {
                case 'page.update':
                    // if (payload.page == 'summary') {
                    //     appState.summary = payload.params;  //will be used on another pages (quotes/orders)
                    // }
                    //
                    // if (payload.page == 'search') {
                    //     appState.search = payload.params.location_id;  //will be used on another pages (quotes/orders)
                    // }

                    // page props (url params) need to be saved here
                    appState.page = payload.page;
                    appState.props[payload.page] = payload.props;
                    break;

                // case 'search.tab.change':
                //     // to recover state state
                //     break;
                //
                // case 'search.fields.update':
                //     // to recover state state
                //     break;
                //
                // case 'results.tire.update':
                //     // to recover last state
                //
                //     // set tires state here
                //     break;
                //
                // case 'customer.params.update':
                //     // to recover last state
                //     break;
            }

            store.trigger('change');
        })
    }

    return store;

});