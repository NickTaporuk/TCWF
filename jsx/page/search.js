define([
    'react',
    'classnames',
    'config',
    'load!components/elements/select',
    'actions/api',
    'promise',
    'lodash',
    'lockr',
    'load!components/elements/postal_code',

], function(
    React,
    cn,
    config,
    SelectField,
    Api,
    Promise,
    _,
    lockr,
    PostalCode
) {
    return {
        displayName: 'search',

        getInitialState: function() {

            return  {
                ready: false,
                activeTab: 'size',
                fieldOptions: {},
                fieldValues: {
                    vehicle: {year: '', make: '', model: '', trim: '', car_tire_id: '', base_category: ''},
                    size: {width: '', height: '', rim: '', load_index: '', speed_rating: '', base_category: ''},
                    part_number: {part_number: ''}
                },
                fieldNamesSelect: {
                    vehicle: {  year            : {text : "Choose Year",    name : "Choose Year",     state : false,    changeLabel : 'make'},
                                make            : {text : 'Choose Make',    name : "Choose Make",     state : false,    changeLabel : 'model'},
                                model           : {text : 'Choose Model',   name : "Choose Model",    state : false,    changeLabel : 'trim'},
                                trim            : {text : 'Choose Trim',    name : "Choose Trim",     state : false,    changeLabel : 'car_tire_id'},
                                car_tire_id     : {text : 'Tire Size',      name : "Tire Size",       state : false,    changeLabel : 'base_category'},
                                base_category   : {text : 'Tire Category',  name : "Tire Category",   state : false,    changeLabel : 'base_category'}
                        },
                    size: {
                                size_width           : {text : "Choose Width",   name : "Choose Width",      state : false,    changeLabel : 'size_height'},
                                size_height          : {text : "Choose Height",  name : "Choose Height",     state : false,    changeLabel : 'size_rim'},
                                size_rim             : {text : "Choose Rim",     name : "Choose Rim",        state : false,    changeLabel : 'size_load_index'},
                                size_load_index      : {text : "Speed Rating",   name : "Speed Rating",      state : false,    changeLabel : 'size_speed_rating'},
                                size_speed_rating    : {text : "Load Index",     name : "Load Index",        state : false,    changeLabel : 'size_base_category'},
                                size_base_category   : {text : "Tire Category",  name : "Tire Category",     state : false,    changeLabel : 'size_base_category'}
                        },
                    part_number: {
                                part_number     : ''
                        }
                },
                SpinnerText: "Loading ...",
                locationDetectState : false ,     // boolean variable is responsible for visualization determine the user's location
                DetectPostCode : false ,     // boolean variable is responsible for visualization determine the user's location
                locations : false,
                geolocationObj: {},
            }
        },

        componentDidMount: function() {
            var self = this;
            var pos = {};
            if (!this.state.ready && config.locationState === 'auto') {
                Promise.all([
                    Api.loadTireParameters(),
                    Api.loadVehicleOptions(),
                ]).then(function (response) {
                    self.setState({
                        ready: true,
                        fieldOptions: _.merge(response[0], response[1]),
                        activeTab: 'vehicle'
                    });
                });
            } else if(!this.state.ready && config.locationState === 'manual') {
                Promise.all([
                    Api.loadTireParameters(),
                    Api.loadVehicleOptions(),
                    Api.loadLocationsManual(),
                    Api.loadDealerConfig()
                ]).then(function (response) {
                    self.setState({
                        ready: true,
                        fieldOptions: _.merge(response[0], response[1]),
                        locations: response[2],
                        activeTab: response[3].default_searching ? response[3].default_searching.replace('by_', '') : 'vehicle'
                    });
                });
            }
        },

        render: function() {
            if (!this.state.ready) {
                var img = config.imagesFolder + 'loader.gif';
                return React.createElement('div', { style: { minHeight: '66px', display: 'block', background: 'url("' + img + '") 50% 50% no-repeat rgb(255, 255, 255)' } });
            }

            return (
                
                <div className={cn('search_wrapper')} id={cn('search_wrapper')}>
                    <div className={cn('search_inner')}>
                        { this._location()}

                        <form id={cn('search_by')} className={cn('search_by')} role="search" onSubmit={this._handleSubmit}>
                            <div className={cn('tabs')}>
                                <ul role="tablist">
                                    {this._tabs()}                                    
                                </ul>
                                {this._tabsContent()}
                            </div>
                        </form>
                    </div>
                </div>
            );
        },

        _location: function() {
            var self = this;
            if(config.locationState === 'auto') {
                if(self.state.DetectPostCode) {
                    return <PostalCode postalcode={this._handlePostalCode}/>
                }
            }
            if(config.locationState === 'manual') {
                var location_select = [];
                if(this.state.locations.length > 0) {
                    for(var i = 0;this.state.locations.length > i;i++) {
                        var str = [];
                        if(!!this.state.locations[i].address_line_1)    str.push(this.state.locations[i].address_line_1);
                        if(!!this.state.locations[i].address_line_2)    str.push(this.state.locations[i].address_line_2);
                        if(!!this.state.locations[i].city)              str.push(this.state.locations[i].city);
                        if(!!this.state.locations[i].country)           str.push(this.state.locations[i].country);
                        str = str.join(',').toString();
                        location_select.push({description:str,value:this.state.locations[i].id.toString()});

                    }
                    return <SelectField
                        options={location_select}
                        value={location_select[0].id} onChange={this._handleLocationChange}
                        name="" label="Choose Location"
                        className={cn(['field'])} required={true} />
                }
            }
        },
        _handlePostalCode: function(response){
            var self = this;
                    if(response[0].results.length > 0) {
                        var pos = response[0].results[0].geometry.location;
                        pos.radius = 200000000;
                        Promise.all([
                            Api.loadLocations(pos)
                        ]).then(function (response) {
                            self._handleRedirect(response[0][0].id);
                            // lockr.set('location_id', response[0][0].id);
                        })
                    } else {
                        console.log('empty result post code _handlePostalCode :');
                        lockr.set('location_id', false);

                        self.setState({
                            locationDetectState : true,
                            DetectPostCode : true

                        });
                    }
        },
        _tabs: function() {
            var tabs = [
                <li key={1} className={cn('tab')} role="presentation">
                    <a href="#vehicle_tab" onClick={this._handleTabClick.bind(this, 'vehicle')} className={cn(['tab_link', 'font_color'])} role="tab" aria-selected={this.state.activeTab == 'vehicle'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE531;' }} /> Search by vehicle</a>
                </li>,
                <li key={2} className={cn('tab')} role="presentation">
                    <a href="#size_tab" onClick={this._handleTabClick.bind(this, 'size')} className={cn('font_color')} role="tab" aria-selected={this.state.activeTab == 'size'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE019;' }} /> Search by tire size</a>
                </li>
            ];
            if (config.sa) {
                tabs.push((
                    <li key={3} className={cn('tab')} role="presentation">
                        <a href="#size_tab" onClick={this._handleTabClick.bind(this, 'part_number')} className={cn('font_color')} role="tab" aria-selected={this.state.activeTab == 'part_number'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8F3;' }} /> Search by part number</a>
                    </li>
                ));
            }
            return tabs;
        },

        _tabsContent: function() {
            var contents = [

                <div key={1} className={cn(['tab_cont', 'search_fields', 'by_vehicle_tab'])} id={cn('by_vehicle_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'vehicle'}>
                    <fieldset className={cn('fields_wrapper')}>
                        <div className={cn(['sixcol', 'fields_wrapper_1'])}>
                            <SelectField
                                        options={this.state.fieldOptions.year}
                                        value={this.state.fieldValues.vehicle.year} onChange={this._handleVehicleChange}
                                        name="year" label={this.state.fieldNamesSelect.vehicle.year.text}
                                        className={cn(['field'])} required={true} />
                            <SelectField 
                                        options={this.state.fieldOptions.make}
                                        value={this.state.fieldValues.vehicle.make} onChange={this._handleVehicleChange}
                                        name="make" label={this.state.fieldNamesSelect.vehicle.make.text} required={true}
                                        className={cn(['field'])} disabled={this.state.fieldOptions.make.length <= 0} />
                            <SelectField 
                                        options={this.state.fieldOptions.model}
                                        defaultValue={this.state.fieldValues.vehicle.model} onChange={this._handleVehicleChange}
                                        name="model" label={this.state.fieldNamesSelect.vehicle.model.text}
                                        className={cn(['field'])} disabled={this.state.fieldOptions.model.length <= 0} required="1" />
                        </div>
                        <div className={cn(['sixcol', 'last', 'fields_wrapper_2'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.trim}
                                        value={this.state.fieldValues.vehicle.trim} onChange={this._handleVehicleChange}
                                        name="trim" label={this.state.fieldNamesSelect.vehicle.trim.text}
                                        className={cn(['field'])} disabled={this.state.fieldOptions.trim.length <= 0} required="1" />
                            <SelectField 
                                        options={this.state.fieldOptions.car_tire_id}
                                        value={this.state.fieldValues.vehicle.car_tire_id} onChange={this._handleFieldChange}
                                        name="car_tire_id" label={this.state.fieldNamesSelect.vehicle.car_tire_id.text}
                                        className={cn(['field'])} disabled={this.state.fieldOptions.car_tire_id.length <= 0} required="1" emptyDesc={false}/>
                            <SelectField 
                                        options={this.state.fieldOptions.base_category}
                                        value={this.state.fieldValues.vehicle.base_category} onChange={this._handleFieldChange}
                                        name="vehicle_base_category" label={this.state.fieldNamesSelect.vehicle.base_category.text}
                                        className={cn(['field'])} emptyDesc="All Tires" />
                        </div>

                        <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                    </fieldset>
                </div>,
                <div key={2} className={cn(['tab_cont', 'search_fields', 'by_tire_size_tab'])} id={cn('by_tire_size_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'size'}>
                    <fieldset className={cn('fields_wrapper')}>
                        <div className={cn(['sixcol', 'fields_wrapper_1'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.width}
                                        value={this.state.fieldValues.size.width} onChange={this._handleFieldChange}
                                        name="size_width" label={this.state.fieldNamesSelect.size.size_width.text}
                                        className={cn(['field'])} required="1" />
                            <SelectField 
                                        options={this.state.fieldOptions.height}        
                                        value={this.state.fieldValues.size.height} onChange={this._handleFieldChange}  
                                        name="size_height" label={this.state.fieldNamesSelect.size.size_height.text} required="1"
                                        className={cn(['last', 'field'])} />
                            <SelectField 
                                        options={this.state.fieldOptions.rim}           
                                        value={this.state.fieldValues.size.rim} onChange={this._handleFieldChange} 
                                        name="size_rim" label={this.state.fieldNamesSelect.size.size_rim.text}
                                        className={cn(['field'])} required="1" />
                        </div>
                        <div className={cn(['sixcol', 'last', 'fields_wrapper_2'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.speed_rating} 
                                        value={this.state.fieldValues.size.speed_rating} onChange={this._handleFieldChange} 
                                        name="size_speed_rating" label={this.state.fieldNamesSelect.size.size_speed_rating.text}
                                        className={cn(['field'])}  />
                            <SelectField 
                                        options={this.state.fieldOptions.load_index} 
                                        value={this.state.fieldValues.size.load_index} onChange={this._handleFieldChange} 
                                        name="size_load_index" label={this.state.fieldNamesSelect.size.size_load_index.text}
                                        className={cn(['last', 'field'])} />
                            <SelectField 
                                        options={this.state.fieldOptions.base_category} 
                                        value={this.state.fieldValues.size.base_category} onChange={this._handleFieldChange} 
                                        name="size_base_category" label={this.state.fieldNamesSelect.size.size_base_category.text}
                                        className={cn(['last', 'field'])} emptyDesc="All Tires" />
                        </div>

                        <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                    </fieldset>
                </div>
            ];
            if (config.sa) {
                contents.push((
                    <div key={3} className={cn(['tab_cont', 'search_fields', 'by_part_number_tab'])} id={cn('by_part_number_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'part_number'}>
                        <fieldset className={cn('fields_wrapper')}>
                            <div className={cn(['sixcol'])}>
                                <label htmlFor={cn('part_number')}>
                                    <span>Enter part number </span><span className="req">*</span>
                                </label>
                                <input onChange={this._handleFieldChange} type="text" id={cn('part_number')} name="part_number" value={this.state.fieldValues.part_number.part_number} />
                            </div>
                            <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                        </fieldset>
                    </div>
                ));
            }

            return contents;
        },

        _isReadyForSearch: function() {
            var isReady = false;
            var values = this.state.fieldValues[this.state.activeTab];
            switch (this.state.activeTab) {
                case 'size':
                    isReady = (values.width && values.height && values.rim);
                    break;
                case 'vehicle':
                    isReady = (values.car_tire_id != false);
                    break;
                case 'part_number':
                    isReady = (values.part_number != false);
                    break;
            }
            return isReady;
        },

        _handleTabClick: function(tab, event) {
            event.preventDefault();
            this.setState({
                activeTab: tab
            });
        },
        _locationDetect:function () {
            var self = this,
                pos = {};
            if(self.state.locationDetectState === false){
                if(window.location.protocol === 'http:' && window.navigator.userAgent.match(/Chrome\/5\d+/i) !== null) {

                    self.setState({
                        locationDetectState : true,
                        DetectPostCode : true
                    });
                } else if (!!window.navigator.geolocation ) {
                    window.navigator.geolocation.getCurrentPosition(function (position) {

                        pos.lat = position.coords.latitude;
                        pos.lng = position.coords.longitude;
                        pos.radius = 2000000000;
                        Promise.all([
                            Api.loadLocations(pos)
                        ]).then(function (response) {
                            lockr.set('location_id', response[0][0].id);
                            self._handleRedirect(response[0][0].id);
                            lockr.set('location_id', false);

                        });
                    },function(error) {
                            lockr.set('location_id', false);
                            self.setState({
                                locationDetectState : true,
                                DetectPostCode      : true
                            });
                        console.log('error _locationDetect:',error);
                    }
                        ,{maximumAge:60000, timeout:5000, enableHighAccuracy:true}
                    );

                } else {
                    self.setState({
                        locationDetectState : true,
                        DetectPostCode : true
                    });
                }
            }

        },
        _handleRedirect: function(location_id){
            var params = _.cloneDeep(this.state.fieldValues[this.state.activeTab]);
            var redirectUrl = config.redirectUrl;
            var str = "";
                params.location_id = location_id;
            if (params.base_category) {
                this.state.fieldOptions.base_category.map(function (baseCat) {
                    if (baseCat.value == params.base_category) {
                        params.filters = {};
                        params.filters.category = baseCat.categories;
                    }
                });
                delete params.base_category;
            }

            for (var key in params) {

                if( !!params[key].category && typeof params[key].category === 'object') {
                    var i=0;
                    for(keys in params[key].category) {
                        if (str != "") {
                            str += "&";
                        }
                        if(!!params[key].category[keys])
                            str += encodeURIComponent(key + "[category]["+i+"]") +'='+ params[key].category[keys];
                        i++;
                    }
                } else {
                    if(!!!params[key]) continue;
                    if (str != "") {
                        str += "&";
                    }
                    str += key + "=" + encodeURIComponent(params[key]);
                }
            }

            lockr.set('location_id', false);
            var link = window.location.protocol+'//'+redirectUrl +'#!results?'+ str;
            window.location.href = link.toString();
        },

        _handleSubmit: function(event) {
            if (event) {
                event.preventDefault();
            }
            var locationId = lockr.get('location_id');
            if(config.locationState === 'auto') this._locationDetect();

            if (this._isReadyForSearch()) {
                if ( locationId ) {
                    this._handleRedirect(locationId);
                }
            }
        },

        _handleFieldChange: function(event) {
            var fieldName = event.target.name.replace( (this.state.activeTab + '_'), '');

            var fieldValues = _.cloneDeep(this.state.fieldValues);
            fieldValues[this.state.activeTab][fieldName] = event.target.value;

            var fieldNames = _.cloneDeep(this.state.fieldNamesSelect);

            if(!!fieldNames.size[event.target.name]) {
                var changeLabel = fieldNames.size[event.target.name].changeLabel.toString();
                fieldNames.size[changeLabel].text = this.state.SpinnerText;
                fieldNames.size[changeLabel].state = true;
            }

            this.setState({
                fieldValues: fieldValues
            });
        },

        _handleVehicleChange: function(event) {
            // select label text change
            var fieldNames = _.cloneDeep(this.state.fieldNamesSelect);
            if(!!fieldNames.vehicle[event.target.name]) {
                var changeLabel = fieldNames.vehicle[event.target.name].changeLabel.toString();
                fieldNames.vehicle[changeLabel].text = this.state.SpinnerText;
                fieldNames.vehicle[changeLabel].state = true;
            }
            this.setState({
                fieldNamesSelect : fieldNames
            });
            var self = this;

            var fields = ['year', 'make', 'model', 'trim'];
            var fieldName = event.target.name;
            var index = fields.indexOf(fieldName);

            var values = _.cloneDeep(this.state.fieldValues.vehicle);
            values[fieldName] = event.target.value;
            
            var values = {
                year: values.year,
                make: index < 1 ? '' : values.make,
                model: index < 2 ? '' : values.model,
                trim: index < 3 ? '' : values.trim
            };

            Api.loadVehicleOptions(values).then(function(options) {
                self._updateVehicleOptions(options, values);
            });
        },
        _handleLocationChange: function(e) {
            lockr.set('location_id', e.target.value);
        },

        _updateVehicleOptions: function(newOptions, newValues) {
            var fieldOptions = _.cloneDeep(this.state.fieldOptions);
            var fieldValues = _.cloneDeep(this.state.fieldValues);
            fieldValues.vehicle = _.assign(fieldValues.vehicle, newValues);
            if (newOptions.car_tire_id[0]) {
                fieldValues.vehicle.car_tire_id = newOptions.car_tire_id[0].value;
            }

            var fieldNames = _.cloneDeep(this.state.fieldNamesSelect);

            for (key in fieldNames) {
                for(keys in fieldNames[key]) {
                    if(typeof fieldNames[key][keys] === 'object' && fieldNames[key][keys].state === true) {
                        fieldNames[key][keys].state = false;
                        fieldNames[key][keys].text = fieldNames[key][keys].name;
                    }
                }
            }

            this.setState({
                fieldOptions: _.assign(fieldOptions, newOptions),
                fieldValues: fieldValues
                , fieldNamesSelect : fieldNames
            });
        },

        _handleLocationSelect: function (locationId) {
            lockr.set('location_id', locationId);
            // A.popup.close();
            this._handleSubmit();
        },

        _handleLocationsClick: function(event) {
            if (event) {
                event.preventDefault();
            }
        }
    }

});