define([
    'react',
    'reactDOM',
    'lib/helper',
    'classnames',
    'lodash',
    'load!actions/act',
    'actions/api',
    'load!components/elements/select',
    'load!components/page/results/tire',
    'load!components/page/results/pagination',
    'load!components/page/results/filterBlock',
    'load!components/page/common/back',
    'load!stores/appStore',
    'promise'
], function (
    React,
    ReactDOM ,
    h,
    cn,
    _,
    Act,
    Api,
    SelectField,
    Tire,
    Pagination,
    FilterBlock,
    Back,
    appStore,
    Promise
) {

    return {
        displayName: 'results',

        getInitialState: function() {
            return {
                ready: false
            };
        },

        componentDidMount: function() {
            if (!this.state.ready) {
                this._init();
            }
        },

        componentDidUpdate: function(prevProps, prevState) {
            if ( !_.isEqual(this.props, prevProps) ) {
                this._init();
            }
            if (this.state.page !== prevState.page) {
                this._scrollToTop();
            }
        },

        componentWillUnmount: function () {
            appStore.savePageState(this);
        },

        render: function() {
            if (!this.state.ready) {
                return null;
            }

            var tires = [];
            var fieldOptions = this.state.fieldOptions;
            var fieldValues = {
                display: this.props.display || 'full',
                order_by: this.props.order_by || 'best_mutch'
            };

            var curTime = new Date().getTime();
            this.state.tires.map(function(tire, i) {
                var tKey = i + curTime;
                tires.push((
                    <Tire key={tKey} tire={tire} isInMile={this.state.isInMile} isTop={(i < 3 && this.state.page == 1)} />
                ));
            }.bind(this));

            return (
                <div>
                    <Back />
                    <div className={cn('results_wrapper')}>
                        <div className={cn('results_title')}>
                            <p className={cn('results_query')}>
                                <span>Found <strong className={cn('results_count')}>{this.state.totalCount}</strong> tires for:</span>
                                <span className={cn('results_query_param')}>{this.state.queryParams}</span>
                            </p>
                        </div>
                        <div id={cn('optional_fields')} className={cn(['box', 'results_filters'])}>
                            <SelectField onChange={this._handleFieldChange} options={fieldOptions.display}  label="Display:" name="display"  className={cn('filter_field')} emptyDesc={false} defaultValue={fieldValues.display} />
                            <SelectField onChange={this._handleFieldChange} options={fieldOptions.order_by} label="Sort by:" name="order_by" className={cn('filter_field')} emptyDesc={false} defaultValue={fieldValues.order_by} />
                        </div>
                        {
                            tires.length > 0 ? null : <h3 className={cn('message')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> We did not find any tires based on your search criteria. Please try searching again later as inventory changes frequently.</h3>
                        }
                        <div className={cn('filters')} id={cn('filters')}>
                            {this._getFilterBlocks()}
                        </div>
                        <div className={cn('results')}>
                            <div className={cn('twelvecol')}>
                                <Pagination activePage={this.state.page} itemsOnPage={this.state.itemsOnPage} totalItems={this.state.totalCount} onPageClick={this._handlePageClick} />
                                {/*<div className={cn('compare_btn_wrapper')}>
                                    <span className={cn(['font_color', 'compare_number'])}>2</span>
                                    <a href="#compare" className={cn(['brand_btn_light', 'btn_small', 'compare_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE915;' }} /> Compare Selected Tires</a>
                                </div>*/}
                            </div>
                            <div className={cn('twelvecol')}>
                                {
                                    (tires.length > 0)
                                    ? 
                                    <ol className={cn('results_list')}>
                                        {tires}                                    
                                    </ol>
                                    : 
                                    null
                                }
                            </div>
                            <div className={cn('twelvecol')}>
                                <Pagination activePage={this.state.page} itemsOnPage={this.state.itemsOnPage} totalItems={this.state.totalCount} onPageClick={this._handlePageClick} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        },

        _init: function () {
            var self = this;

            Promise.all([
                Api.searchTires(this.props),
                Api.loadTireParameters(),
                Api.loadLocation(this.props.location_id),
                Api.loadDealerConfig()
            ]).then(function (responses) {
                var results = responses[0];
                var tireParameters = responses[1];
                var location = responses[2];
                var dealerConfig = responses[3];

                var queryParams = '';
                if (self.props.car_tire_id) {
                    queryParams = self.props.year + ' ' + self.props.make + ' ' + self.props.model + ' ' + self.props.trim;
                } else if (self.props.part_number) {
                    queryParams = self.props.part_number;
                } else {
                    queryParams = self.props.width + '/' + self.props.height + 'R' + self.props.rim;
                }
                
                if (dealerConfig.client_type == 3 && results.filters.brand) {
                    results.filters.brand.required_brands = ['Bridgestone', 'Firestone', 'Fuzion'];
                }

                var state = {
                    ready: true,
                    page: results.page,
                    tires: results.tires,
                    totalCount: results.nb_results,
                    filters: results.filters,

                    fieldOptions: {
                        display: tireParameters.display,
                        order_by: tireParameters.order_by
                    },

                    isInMile: location.country !== 'Canada',
                    itemsOnPage: dealerConfig.items_per_page,

                    queryParams: queryParams
                };

                self.setState(state);
            });
        },

        _getFilterBlocks: function() {
            if (this.state.tires.length > 0) {
                var filters = null;
                if (Object.keys(this.state.filters).length > 0) {
                    var values = this.props.filters || {brand: [], category: [], run_flat: [], light_track: []};
                    var filtersInfo = [
                        {key: 'run_flat', desc: 'Run-Flat', all: 'All/None'}, 
                        {key: 'light_truck', desc: 'Light Track', all: 'All/None'}, 
                        {key: 'brand', desc: 'Brand', all: 'All Brands'},
                        {key: 'category', desc: 'Category', all: 'All Categories'}
                    ];
                    filters = [];
                    filtersInfo.forEach(function(info, i) {
                        if (this.state.filters[info.key].parameters.length > 1) {
                            filters.push((
                                <FilterBlock key={i} by={info.desc} topDirection={ !this.state.totalCount } name={info.key} allDesc={info.all} defaultValue={ values[info.key] ? _.toArray(values[info.key]) : [] } data={ this.state.filters[info.key] } onChange={this._handleFilterChange} />
                            ));
                        }
                    }, this);
                }
            }
            return filters;
        },

        _scrollToTop: function() {
            var results = ReactDOM.findDOMNode(this);
            h.scrollToTop(results);
        },

        _handleFieldChange: function(event) {
            var fieldName = event.target.name.replace('filter_', '');
            var params = _.cloneDeep(this.props);
            params[fieldName] = event.target.value;
            params.page = 1;
            Act.route('results', params);
        },

        _handleFilterChange: function(name, values) {
            var params = _.cloneDeep(this.props);
            if (!params.filters) {
                params.filters = {};
            }
            params.filters[name] = values;
            params.page = 1;
            Act.route('results', params);
        },

        _handlePageClick: function(page, event) {
            event.preventDefault();
            var params = _.cloneDeep(this.props);
            params.page = page;
            Act.route('results', params);
        }
    }
});