define([
    'dispatcher',
    'promise',
    'ajax',
    'isMobile',
    'validate',
    'moment',
    'load!actions/constants',
    'config'
], function(
    dispatcher,
    Promise,
    ajax,
    isMobile,
    validate,
    moment,
    constants,
    config
) {

    ajax.beforeSend = function() {
        dispatcher.ajax.dispatch({
            actionType: constants.BEFORE_REQUEST
        });
    };

    ajax.complete = function() {
        dispatcher.ajax.dispatch({
            actionType: constants.RESPONSE_RECEIVED
        });
    };

    ajax.error = function(error) {
        dispatcher.dispatch({
            actionType: constants.ERROR_RESPONSE,
            error: error
        });
    };

    function prepareVehicleResponse(response) {
        var newOptions = [];
        response.data.values.map(function(val, i) {
            newOptions.push({
                'value': val,
                'description': val
            });
        });

        return newOptions;
    }

    validate.extend(validate.validators.datetime, {
        // The value is guaranteed not to be null or undefined but otherwise it
        // could be anything.
        parse: function(value, options) {
            return +moment(value);
        },
        // Input is a unix timestamp
        format: function(value, options) {
            var format = options.dateOnly ? 'YYYY-MM-DD' : this.timeFormat;
            return moment(value).format(format);
        }
    });

    function validateParamsForQuote(values, requiredParams) {
        var constraints = {
            name: {
                length: {maximum: 255}
            },
            email: {
                email: true,
                length: {maximum: 255}
            },
            phone: {
                format: {
                    pattern: "^\\(?[0-9]{3}\\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$",
                    message: "is not valid phone number"
                }
            },
            preferred_time: {
                datetime: {
                    earliest: moment()
                },
            },
            notes: {
                length: {maximum: 500}
            }
        };

        if (requiredParams) {
            requiredParams.map(function(field) {
                if (!constraints[field]) {
                    constraints[field] = {};
                }
                constraints[field].presence = true;
            });
        }
        return validate(values, constraints);
    }


    Api = {
        loadLocations: function(pos) {

            return ajax.make({
                method: 'post',
                data: {latitude:pos.lat,longitude: pos.lng,radius:pos.radius},
                url: 'location/search',
                cache: true
            }).then(function(response) {
                return response.data.locations;
            });
        },
        loadLocationsManual: function() {

            return ajax.make({
                url: 'location/list',
                cache: true
            }).then(function(response) {
                return response.data.locations;
            });
        },
        loadPostalLocations: function(postalCode) {

            return ajax.make({
                url: 'http://maps.googleapis.com/maps/api/geocode/json?address='+postalCode,
                cache: true
            },true).then(function(response) {
                return response;
            });
        },

        loadLocation: function(locationId) {
            return Api.loadLocations().then(function(locations) {
                var location = null;
                locations.map(function(loc) {
                    if (loc.id == locationId) {
                        location = loc;
                    }
                });
                return location;
            });
        },

        loadLocationConfig: function(locationId) {
            // we need location config only for mobile version (to gate call number) for now
            if (isMobile.any) {
                return ajax.make({
                    url: 'location/' + locationId + '/config',
                    cache: true
                }).then(function(response) {
                    return response.data;
                });
            } else {
                return Promise.resolve({
                    call_number: null
                }).then(function(response) {
                    return response;
                });
            }
        },

        loadTireParameters: function() {
            return ajax.make({
                url: 'tire/parameters',
                cache: true
            }).then(function(response) {
                return response.data;
            });
        },

        searchTires: function(searchParams) {
            if (!searchParams) {
                return;
            }
            var searchParams = _.cloneDeep(searchParams);

            var method;
            if (searchParams.part_number) {
                method = 'searchByPartNumbers';
                if (!searchParams.part_numbers && searchParams.part_number) {
                    searchParams.part_numbers = [searchParams.part_number];
                    delete searchParams.part_number;
                }
            } else if (searchParams.car_tire_id) {
                method = 'searchByCarTire';
            } else {
                method = 'searchBySize';
            }

            searchParams.needed_filters = ['brand', 'run_flat', 'light_truck', 'category'];

            return ajax.make({
                url: 'tire/' + method,
                data: searchParams,
                method: 'post',
                oneTimeCache: true
            }).then(function(response) {
                return response.data;
            });
        },

        loadTire: function(tireId) {
            return ajax.make({
                url: 'tire/' + tireId,
                oneTimeCache: true
            }).then(function(response){
                return response.data;
            });
        },

        loadVehicleOptions: function(values, updateField) {
            var fields = ['year', 'make', 'model', 'trim', 'car_tire_id'];
            var index = updateField ? fields.indexOf(updateField) : 3;
            var allOptions = {};   
            values = values || {};
            
            for (var i = 0; i < 5; i++) {
                var field = fields[i];
                values[field] = index < i || !values[field] ? '' : values[field];
                allOptions[field] = [];
                if (!updateField && !values[field]) {
                    index = i - 1;
                    updateField = fields[index];
                }
            }

            var promises = [];
            if (values.trim) {
                promises.push(ajax.make({
                    url: 'vehicle/tireSizes',
                    data: values,
                    cache: true
                }).then(function(response) {
                    var options = [];
                    response.data.values.map(function(option) {
                        options.push({
                            value: option.cartireid,
                            description: option.fitment + ' ' + option.size_description
                        });
                    });
                    allOptions.car_tire_id = options;
                }));
            }

            if (values.model) {
                promises.push(ajax.make({
                    url: 'vehicle/trims',
                    data: values,
                    cache: true
                }).then(function(response) {
                    allOptions.trim = prepareVehicleResponse(response);
                }));
            }

            if (values.make) {
                promises.push(ajax.make({
                    url: 'vehicle/models',
                    data: values,
                    cache: true
                }).then(function(response) {
                    allOptions.model = prepareVehicleResponse(response);
                }));
            }

            if (values.year) {
                promises.push(ajax.make({
                    url: 'vehicle/makes',
                    data: {year: values.year},
                    cache: true
                }).then(function(response) {
                    allOptions.make = prepareVehicleResponse(response);
                }));
            }

            promises.push(ajax.make({
                url: 'vehicle/years',
                cache: true
            }).then(function(response) {
                allOptions.year = prepareVehicleResponse(response);
            }));

            return Promise.all(promises).then(function() {
                return allOptions;
            });
        },

        loadDealerInfo: function() {
            return ajax.make({
                url: 'dealer/list',
                cache: true
            }).then(function(response) {
                return response.data.dealers[0];
            });
        },

        loadDealerConfig: function() {
            return ajax.make({
                url: 'dealer/config',
                data: {wdg:true},
                cache: true
            }).then(function(response) {
                return response.data;
            });
        },
        setSession: function() {
            return ajax.make({
                url: 'session',
                method: 'post',
                data: {is_returned: config.isReturnedUser, source: (config.sa ? 'instore' : 'website') }
            }).then(function(response) {
                return response.data.session_id;
            });
        }
    };

    return Api;
});