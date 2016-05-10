define([
    'react',
    'classnames',
    'config',
    'load!actions/act',
    'lib/helper',
    'lodash',
    'load!components/page/summary/offerLine',
    'isMobile',
    'load!components/page/common/back',
    'actions/api',
    'load!stores/appStore',
    'promise'
], function(
    React,
    cn,
    config,
    A,
    h,
    _,
    OfferLine,
    isMobile,
    Back,
    Api,
    appStore,
    Promise
) {

    return {
        displayName: 'summary',

        getInitialState: function() {
            return {
                ready: false
            };
        },

        // componentWillMount: function () {
        //     var lastState = appStore.getPageState(this);
        //     if (lastState) {
        //         this.setState(lastState);
        //     }
        // },

        componentDidMount: function() {
            if (!this.state.ready) {
                this._init();
            }
        },

        componentDidUpdate: function(prevProps, prevState) {
            if (!_.isEqual(this.props, prevProps)) {
                this._init();
            }
        },

        componentWillUnmount: function () {
            appStore.savePageState(this); //this.constructor.displayName, this.state);
        },

        render: function() {
            if (!this.state.ready) {
                return null;
            }

            var tire = this.state.tire;
            var quote = this.state.quote;
            if (Object.keys(quote) <= 0 || Object.keys(tire) <= 0) {
                return null;
            }

            var recyclingFee = null;
            if (quote.recycling_fee) {
                recyclingFee = <tr>
                    <td>{quote.recycling_fee.name}</td>
                    <td>${h.priceFormat(quote.recycling_fee.total_value)}</td>
                </tr>;
            }

            var quantityItems = [];
            for(var q = 1; q <= tire.quantity && q <= 8; q++) {
                quantityItems.push(<option key={q} value={q}>{q}</option>);
            }

            return (
                <div>
                    <Back />

                    <div className={cn(['max_width', 'summary_wrapper'])}>
                        <div className={cn('table_wrapper')}>
                            <table className={cn('table')}>
                                <thead>
                                    <tr>
                                        <th>Tires</th>
                                        <th>Price</th>
                                        <th>Qty</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{tire.brand + ' ' + tire.model}</td>
                                        <td>${ h.priceFormat(tire.price) }</td>
                                        <td>
                                            <label className={cn(['qty', 'compare_qty'])} onChange={this._handleQuantityChange}>
                                                <select defaultValue={this.props.quantity}>
                                                    {quantityItems}
                                                </select>
                                            </label>
                                        </td>
                                        <td>${ h.priceFormat(this.props.quantity * tire.price) }</td>
                                    </tr>
                                    <tr>
                                        <td>{ tire.size_short + ' ' + tire.load_index + tire.speed_rating}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>Part #{ tire.part_number }</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {this._getServicesBlock(quote.services)}
                        {this._getServicesBlock(quote.optional_services, true)}

                        <div className={cn('table_wrapper')}>
                            <table className={cn('table')}>
                                <thead>
                                    <tr>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Sub-total</td>
                                        <td>${h.priceFormat(quote.total.sub_total)}</td>
                                    </tr>
                                    { this.state.quote.discount ? <OfferLine type="discount" offer={this.state.quote.discount} onClick={this._handleDiscountClick} onChange={this._handleDiscountChange} /> : null }
                                    { recyclingFee && quote.recycling_fee.is_taxable ? recyclingFee : null }
                                    <tr>
                                        <td>{quote.tax.name}</td>
                                        <td>${h.priceFormat(quote.tax.total_value)}</td>
                                    </tr>
                                    { recyclingFee && quote.recycling_fee.is_taxable ? null : recyclingFee }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td><sup dangerouslySetInnerHTML={{ __html: '&#8224;' }} />Total Price:</td>
                                        <td>${h.priceFormat(quote.total.price)}</td>
                                    </tr>
                                    { this.state.quote.rebates[0] ? <OfferLine type="rebate" offer={this.state.quote.rebates[0]} /> : null }
                                </tfoot>
                            </table>
                        </div>

                        <p dangerouslySetInnerHTML={{ __html: quote.legal_information.replace(/(?:\r\n|\r|\n)/g, "<br />")}} />

                        {this._getButtons()}
                    </div>
                </div>
            );
        },

        _init: function () {
            var self = this,
                props = this.props;

            var tireParams = h.base64Decode(props.tire_id).split('||');
            var locationId = tireParams[3];

            var promises = [
                Api.loadTire(props.tire_id),
                Api.loadQuote(props.tire_id, props.quantity, props.optional_services, props.with_discount, props.custom_discount),
                Api.loadDealerConfig(),
                Api.loadLocationConfig(locationId)
            ];

            Promise.all(promises).then(function(responses) {
                var tire = responses[0];
                var quote = responses[1];
                var dealerConfig = responses[2];

                self.setState({
                    ready: true,
                    withOrderBtn: !config.sa && dealerConfig.ecommerce && dealerConfig.ecommerce.services && dealerConfig.ecommerce.services.stripe && dealerConfig.ecommerce.services.stripe.publishable_key,
                    quote: quote,
                    tire: tire,
                    callNumber: responses[3].call_number
                });
            });
        },

        _getButtons: function() {
            var btns = {};
            if (config.sa) {
                var btns = {
                    email: <a href="#email" onClick={this._handleEmailClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0BE;' }} /> Email Quote</a>,
                    print: <a href="#print" onClick={this._handlePrintClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8AD;' }} /> Print Quote</a>
                };
            } else {
                var btns = {
                    quote: <a href="#quote" onClick={this._handleQuoteClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE14F;' }} /> Get a Quote</a>,
                    appointment: <a href="#appointment" onClick={this._handleAppointmentClick} className={cn(['brand_btn_light', 'btn_small'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE192;' }} /> Make an Appointment</a>
                };
                if (this.state.withOrderBtn) {
                    btns.order = <a href="#order" onClick={this._handleOrderClick} className={cn('brand_btn')}>Order Your Tires <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C8;' }} /></a>
                }

                if (isMobile.any && this.state.callNumber) {
                    btns.clickToCall = <a href={'tel:' + this.state.callNumber} className={cn('brand_btn_light', 'btn_small')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0B0;' }} /> Call Us</a>
                }
            }
            
            return (
                <div className={cn(['twelvecol', 'bottom_btns'])}>
                    {btns.clickToCall
                        ? <div>{btns.clickToCall}</div>
                        : null
                    } 
                    <div className={cn(['sixcol', 'col_left'])}>
                        {btns.quote ? btns.quote : null}
                        {btns.order ? btns.appointment : null}

                        {btns.email ? btns.email : null}
                        
                    </div>
                    <div className={cn(['sixcol', 'last', 'col_right'])}>
                        {btns.print ? btns.print : null}

                        {btns.order ? btns.order : btns.appointment}
                    </div>
                </div>
            );
        },

        _getServicesBlock: function(servicesInfo, isOptional) {
            if (servicesInfo.length == 0) {
                return null;
            }

            var isOptional = isOptional || false,
                services = [];

            Object.keys(servicesInfo).map(function(i){
                var info = servicesInfo[i];
                var toggleCell = null;

                if (isOptional) {
                    toggleCell = <td className={cn('toggle_cell')}>
                        <button onClick={this._handleServiceClick.bind(this, info.key)} className={cn({toggle_cell_btn: true, toggle_remove: info.applied, toggle_add: !info.applied})}>
                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: (info.applied ? '&#xE15C;' : '&#xE147;') }} /><span>{ info.applied ? 'Remove' : 'Add' }</span>
                        </button>
                    </td>
                }

                services.push((
                    <tr key={i} className={ cn({service_added: (isOptional && info.applied)}) }>
                        {toggleCell}
                        <td>
                            {info.name}<br />
                            {info.description ? <small>{info.description}<br /></small> : null}
                            {info.link ? <small><a href={info.link} target="_blank">Learn more</a></small> : null}
                        </td>
                        <td>${h.priceFormat(info.total_price)}</td>
                    </tr>
                ));
            }.bind(this));


            return <div className={cn('table_wrapper')}>
                <table className={cn({table: true, toggle_table: isOptional, optional_services: isOptional})}>
                    <thead>
                        <tr>
                            <th colSpan={isOptional ? 2 : null}>{isOptional ? 'Optional Services' : 'Installation'}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {services}
                    </tbody>
                </table>
            </div>
        },

        _getActiveOptServicesKeys: function() {
            var keys = [];
            var self = this;
            Object.keys(this.state.quote.optional_services).map(function(i) {
                var service = self.state.quote.optional_services[i];
                if (service.applied) {
                    keys.push(service.key);
                }
            });

            return keys;
        },

        _getParamsForQuote: function() {
            var discount = this.state.quote.discount;
            return {
                tire_id: this.props.tire_id,
                quantity: this.props.quantity,
                optional_services: this._getActiveOptServicesKeys(),
                with_discount: discount && discount.tried_to_apply,
                custom_discount: discount && discount.is_custom ? discount.total_value : null
            }
        },

        _handleServiceClick: function(serviceKey, event) {
            event.preventDefault();
            var optServices = this._getActiveOptServicesKeys();
            //add/remove clicked service
            if (optServices.indexOf(serviceKey) === -1) {
                optServices.push(serviceKey);
            } else {
                _.remove(optServices, function(key) {
                  return key == serviceKey;
                });
            }
            var params = this._getParamsForQuote();
            params.optional_services = optServices;
            A.route('summary', params);
        },

        _handleQuantityChange: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.quantity = event.target.value;
            A.route('summary', params);
        },

        _handleDiscountClick: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.with_discount = !params.with_discount;
            A.route('summary', params);
        },

        _handleDiscountChange: function(event) {
            event.preventDefault();
            var params = this._getParamsForQuote();
            params.custom_discount = event.target.value;
            A.route('summary', params);
        },

        _handleAppointmentClick: function(event) {
            event.preventDefault();
            A.route('quote_form', {type: 'appointment'});
        },

        _handleOrderClick: function(event) {
            event.preventDefault();
            // var params = this._getParamsForQuote();
            // params.with_discount = this.state.quote.discount && this.state.quote.discount.applied;
            A.route('order');
            // A.orderPage.update(params);
        },

        _handleQuoteClick: function(event) {
            event.preventDefault();
            A.route('get_a_quote');
        },

        _handleEmailClick: function(event) {
            event.preventDefault();
            A.route('quote_form', {type: 'email'});
        },

        _handlePrintClick: function(event) {
            event.preventDefault();
            A.route('quote_form', {type: 'print'});
        }

    }
});