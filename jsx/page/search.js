define([
    'react',
    'classnames',
    'config',
    'load!actions/act',
    'load!components/elements/select',
    'load!components/page/search/locations',
    'actions/api',
    'load!stores/appStore',
    'promise',
    'lodash',
    'lockr'
], function(
    React,
    cn,
    config,
    A,
    SelectField,
    Locations,
    Api,
    appStore,
    Promise,
    _,
    lockr
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
                }
            }
        },

        componentWillMount: function () {
            var lastState = appStore.getPageState(this);
            if (lastState) {
                this.setState(lastState);
            }
        },

        componentDidMount: function() {
            var self = this;
            if (!this.state.ready) {
                Promise.all([
                    Api.loadTireParameters(),
                    Api.loadVehicleOptions(),
                    Api.loadLocations(),
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

        componentWillUnmount: function () {
            appStore.savePageState(this);
        },
        
        render: function() {
            if (!this.state.ready) {
                return null;
            }

            return (
                <div className={cn('search_wrapper')} id={cn('search_wrapper')}>
                    <div className={cn('search_inner')}>
                        <form id={cn('search_by')} className={cn('search_by')} role="search" onSubmit={this._handleSubmit}>
                            { this.state.locations.length > 1
                                ? <a href="#locations" onClick={this._handleLocationsClick} className={cn(['change_location', 'modal_open'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0C8;' }} />Change Location</a>
                                : null
                            }
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
                                        name="year" label="Choose Year"
                                        className={cn(['field'])} required={true} />
                            <SelectField 
                                        options={this.state.fieldOptions.make}
                                        value={this.state.fieldValues.vehicle.make} onChange={this._handleVehicleChange}
                                        name="make" label="Choose Make" required={true}
                                        className={cn(['field'])} disabled={this.state.fieldOptions.make.length <= 0} />
                            <SelectField 
                                        options={this.state.fieldOptions.model}
                                        defaultValue={this.state.fieldValues.vehicle.model} onChange={this._handleVehicleChange}
                                        name="model" label="Choose Model"
                                        className={cn(['field'])} disabled={this.state.fieldOptions.model.length <= 0} required="1" />
                        </div>
                        <div className={cn(['sixcol', 'last', 'fields_wrapper_2'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.trim}
                                        value={this.state.fieldValues.vehicle.trim} onChange={this._handleVehicleChange}
                                        name="trim" label="Choose Trim"
                                        className={cn(['field'])} disabled={this.state.fieldOptions.trim.length <= 0} required="1" />
                            <SelectField 
                                        options={this.state.fieldOptions.car_tire_id}
                                        value={this.state.fieldValues.vehicle.car_tire_id} onChange={this._handleFieldChange}
                                        name="car_tire_id" label="Tire Size"
                                        className={cn(['field'])} disabled={this.state.fieldOptions.car_tire_id.length <= 0} required="1" emptyDesc={false}/>
                            <SelectField 
                                        options={this.state.fieldOptions.base_category}
                                        value={this.state.fieldValues.vehicle.base_category} onChange={this._handleFieldChange}
                                        name="vehicle_base_category" label="Tire Category"
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
                                        name="size_width" label="Choose Width"  
                                        className={cn(['field'])} required="1" />
                            <SelectField 
                                        options={this.state.fieldOptions.height}        
                                        value={this.state.fieldValues.size.height} onChange={this._handleFieldChange}  
                                        name="size_height" label="Choose Height" required="1" 
                                        className={cn(['last', 'field'])} />
                            <SelectField 
                                        options={this.state.fieldOptions.rim}           
                                        value={this.state.fieldValues.size.rim} onChange={this._handleFieldChange} 
                                        name="size_rim" label="Choose Rim"    
                                        className={cn(['field'])} required="1" />
                        </div>
                        <div className={cn(['sixcol', 'last', 'fields_wrapper_2'])}>
                            <SelectField 
                                        options={this.state.fieldOptions.speed_rating} 
                                        value={this.state.fieldValues.size.speed_rating} onChange={this._handleFieldChange} 
                                        name="size_speed_rating" label="Speed Rating" 
                                        className={cn(['field'])}  />
                            <SelectField 
                                        options={this.state.fieldOptions.load_index} 
                                        value={this.state.fieldValues.size.load_index} onChange={this._handleFieldChange} 
                                        name="size_load_index" label="Load Index" 
                                        className={cn(['last', 'field'])} />
                            <SelectField 
                                        options={this.state.fieldOptions.base_category} 
                                        value={this.state.fieldValues.size.base_category} onChange={this._handleFieldChange} 
                                        name="size_base_category" label="Tire Category"
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

        _handleSubmit: function(event) {
            if (event) {
                event.preventDefault();
            }
            var params = _.cloneDeep(this.state.fieldValues[this.state.activeTab]);
            var locationId = lockr.get('location_id');

            if (this._isReadyForSearch()) {
                if ( locationId ) {
/*                    params.location_id = locationId;

                    if (params.base_category) {
                        this.state.fieldOptions.base_category.map(function (baseCat) {
                            if (baseCat.value == params.base_category) {
                                params.filters = {};
                                params.filters.category = baseCat.categories;
                            }
                        });
                        delete params.base_category;
                    }

                    A.route('results', params);*/
/*
                    var params = _.cloneDeep(this.state.fieldValues[this.state.activeTab]);
                    var locationId = lockr.get('location_id');
*/
                    // console.log('params:',params,'config:',config);

                    var redirectUrl = config.redirectUrl;
                    var str = "";
                    if ( locationId )
                        params.location_id = locationId;
                    for (var key in params) {
                        if (str != "") {
                            str += "&";
                        }
                        str += key + "=" + encodeURIComponent(params[key]);
                    }
                    var link = window.location.protocol+'//'+redirectUrl +'#!results?'+ str;
                    console.log('link:',link);
                    // console.log('this.state:',this.state);
                    // console.log('lockr.get(location_id):',lockr.get('location_id'));
                    window.location.href = link.toString();

                } else {
                    this._handleLocationsClick();    
                }
            }
        },

        _handleFieldChange: function(event) {
            var fieldName = event.target.name.replace( (this.state.activeTab + '_'), '');

            var fieldValues = _.cloneDeep(this.state.fieldValues);
            fieldValues[this.state.activeTab][fieldName] = event.target.value;
            this.setState({
                fieldValues: fieldValues
            });
        },

        _handleVehicleChange: function(event) {
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

        _updateVehicleOptions: function(newOptions, newValues) {
            var fieldOptions = _.cloneDeep(this.state.fieldOptions);
            var fieldValues = _.cloneDeep(this.state.fieldValues);
            fieldValues.vehicle = _.assign(fieldValues.vehicle, newValues);
            if (newOptions.car_tire_id[0]) {
                fieldValues.vehicle.car_tire_id = newOptions.car_tire_id[0].value;
            }
            this.setState({
                fieldOptions: _.assign(fieldOptions, newOptions),
                fieldValues: fieldValues
            });
        },

        _handleLocationSelect: function (locationId) {
            lockr.set('location_id', locationId);
            A.popup.close();
            this._handleSubmit();
        },

        _handleLocationsClick: function(event) {
            if (event) {
                event.preventDefault();
            }

            A.popup.show(
                'Please select a preferred location:',
                <Locations
                    locations={this.state.locations}
                    location_id={lockr.get('location_id')}
                    onSelect={this._handleLocationSelect} />,
                'locations'
            );
        }
    }

});