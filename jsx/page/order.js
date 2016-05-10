define([
    'react',
    'classnames',
    'load!actions/act',
    'lib/helper',
    'load!components/elements/select',
    'load!components/page/common/mainPrices',
    'validate',
    'moment',
    'load!components/page/common/formField',
    'load!components/page/common/back',
    'config',
    'actions/api',
    'load!stores/appStore',
    'promise'
], function(
    React,
    cn,
    A,
    h,
    SelectField,
    MainPrices,
    validate,
    moment,
    Field,
    Back,
    config,
    Api,
    appStore,
    Promise
) {

    return {
        displayName: 'order',

        getInitialState: function() {
            return {
                ready: false,
                disabled: false,
                errors: {},
                values: {
                    vehicle: {}
                }
            };
        },

        componentWillMount: function() {
            var lastState = appStore.getPageState(this);
            if (lastState) {
                this.setState({
                    values: lastState.values
                });
            } else {
                var values = _.cloneDeep(this.state.values);
                values.preferred_time = moment().add(1, 'd').minutes(0).hour(13).format('YYYY-MM-DD HH:mm');
                this.setState({
                    values: values
                });
            }
        },

        componentDidMount: function() {
            var searchState = appStore.getPageState('search');
            var vehicleValues = Object.keys(this.state.values.vehicle).length > 0
                ? this.state.values.vehicle
                : (searchState ? searchState.fieldValues.vehicle : {});
            var summaryProps = appStore.getPageProps('summary');
            summaryProps.id = summaryProps.tire_id;
            delete summaryProps.tire_id;
            // var summaryState = appStore.getPageState('summary');

            Promise.all([
                Api.loadVehicleOptions(vehicleValues),
                Api.loadQuote(summaryProps.id, summaryProps.quantity, summaryProps.optional_services, summaryProps.with_discount, summaryProps.custom_discount),
                Api.orderCreate({tires: [summaryProps]}),
                Api.loadDealerConfig()
            ]).then(function(responses){
                var values = _.cloneDeep(self.state.values);
                values.vehicle = vehicleValues;

                self.setState({
                    ready: true,
                    options: responses[0],
                    values: values,
                    quote: responses[1],
                    order: responses[2],
                    status: responses[2].status,
                    stripeKey: responses[3].ecommerce.services.stripe.publishable_key
                })
            });

            var self = this;
            // load stripe here
            if (typeof window.Stripe == 'undefined') {
                requirejs(['stripe'], function() {
                    self._isStripeLoaded = true;
                });
            } else {
                self._isStripeLoaded = true;
            }
        },
        
        componentWillUnmount: function() {
            appStore.savePageState(this);
        },

        render: function() {
            if (!this.state.ready) {
                return null;
            }

            return (
                <div>
                    <Back />

                    <div className={cn('order_wrapper')}>
                        <form action="confirmation.php" className={cn('order_form')} onSubmit={this._handleFormSubmit}>
                            <fieldset className={cn('order_options')}>
                                <div className={cn('order_option')}>
                                    <div className={cn('order_option_inner')}>
                                        <input style={ {display: 'none'} } type="radio" name="order_options" id={cn('order_option_cc')} value="credit-card" defaultChecked={true} />
                                        <label htmlFor={cn('order_option_cc')}>
                                            Supported credit cards
                                            <img src={config.imagesFolder + 'credit-cards.png'} alt="Visa, MasterCard, or American Express" />
                                        </label>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className={cn(['sixcol', 'col_left', 'order_fields'])}>

                                <Field type="text" name="name" onChange={this._fieldChange} defaultValue={this.state.values.name} ref="name" label="Your Name" required={true} error={this._getError('name')} disabled={this.state.status == 'incomplete'} />
                                <Field type="email" name="email" onChange={this._fieldChange} defaultValue={this.state.values.email} ref="email" label="Email Address" required={true} error={this._getError('email')} disabled={this.state.status == 'incomplete'} />
                                <Field type="tel" name="phone" onChange={this._fieldChange} defaultValue={this.state.values.phone} ref="phone" label="Phone Number" required={true} error={this._getError('phone')} disabled={this.state.status == 'incomplete'} />
                                <Field type="datetime" ref="datetime" name="datetime" onChange={this._fieldChange} defaultValue={this.state.values.preferred_time} label="Preferred Date and Time" disabled={this.state.status == 'incomplete'} error={this._getError('preferred_time')}
                                       custom={{
                                                isValidDate: this._isValidDate,
                                                inputProps: {'name': "preferred_time", 'readOnly': true},
                                                dateFormat: "YYYY-MM-DD",
                                                timeFormat: "HH:mm" 
                                        }}
                                />

                                <div className={cn('control_wrapper')}>
                                    <label htmlFor={cn('vehicle_year')}>Vehicle Info <span className="req">*</span></label>
                                    <div className={cn(['sixcol', 'field'])}>
                                        <SelectField name="year" options={this.state.options.year} disabled={this.state.status == 'incomplete'} emptyDesc="- Year -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.year} />
                                    </div>
                                    <div className={cn(['sixcol', 'last', 'field'])}>
                                        <SelectField name="make" options={this.state.options.make} disabled={this.state.status == 'incomplete'} emptyDesc="- Make -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.make} />
                                    </div>
                                </div>

                                <div className={cn('control_wrapper')}>
                                    <div className={cn('row')}>
                                        <div className={cn(['sixcol', 'field'])}>
                                            <SelectField name="model" options={this.state.options.model} disabled={this.state.status == 'incomplete'} emptyDesc="- Model -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.model} />
                                        </div>
                                        <div className={cn(['sixcol', 'last', 'field'])}>
                                            <SelectField name="trim" options={this.state.options.trim} disabled={this.state.status == 'incomplete'} emptyDesc="- Trim -" withWrapper={false} onChange={this._vehicleChange} value={this.state.values.vehicle.trim} />
                                        </div>
                                    </div>
                                    {this._getError('vehicle_info')}
                                </div>
                                
                                <Field type="textarea" name="notes" onChange={this._fieldChange} defaultValue={this.state.values.notes} ref="notes" label="Notes" error={this._getError('notes')} disabled={this.state.status == 'incomplete'} />
                            </fieldset>
                            <div className={cn(['sixcol', 'last', 'col_right', 'order_info'])}>
                                
                                <Field type="text" name="card_number" defaultValue="" ref="card_number" label="Credit Card Number" required={true} error={this._getError('number')} 
                                    custom={{
                                        autoComplete: 'off',
                                        pattern: "\\d*",
                                        maxLength: 16
                                    }}
                                />

                                <Field type="text" name="cvc_number" defaultValue="" ref="cvc_number" label="VC Number" required={true} error={this._getError('cvc')} 
                                    note="(3 digit security code on the back of the card)"
                                    custom={{
                                        autoComplete: 'off',
                                        pattern: "\\d*",
                                        className: cn('sixcol'),
                                        maxLength: 4
                                    }}
                                />

                                <div className={cn(['control_wrapper', 'order_expiration'])}>
                                    <label htmlFor={cn('order_expiration_month')}>Expiration Date (MM/YYYY) <span className="req">*</span></label>
                                    <input type="text" id={cn('order_expiration_month')} className={cn('sixcol')} maxLength="2" pattern="\d*" required ref="exp_month" defaultValue="" />
                                    <input type="text" id={cn('order_expiration_year')} className={cn(['sixcol', 'last'])} maxLength="4" pattern="\d*" required ref="exp_year" defaultValue="" />
                                    <div style={{clear: 'both'}} />
                                    {this._getError('exp_month')}
                                    {this._getError('exp_year')}
                                </div>
                                
                                <MainPrices quote={this.state.quote} order={this.state.order} />
                                
                                <p className={cn('textcenter')}>
                                    <em>* Outstanding balance will be payable after installation.</em>
                                    <img src={config.imagesFolder + 'verify-security.png'} alt="GoDaddy.com verified and secured" className={cn('verified')} />
                                </p>
                                <button disabled={this.state.disabled} type="submit" className={cn('brand_btn')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5CA;' }} /> Place Your Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        },

        _fieldChange: function(event) {
            var values = _.cloneDeep(this.state.values);
            values[event.target.name] = event.target.value;
            this.setState({
                values: values
            });
        },

        _isValidDate: function( current ) {
            return current.isAfter( moment().add(1, 'd').subtract(1,'day') );
        },

        _getVehicleSelector: function(fieldName) {
            var options = [];
            this.state.vehicle[fieldName]


            return (
                <select id={cn('vehicle_' + fieldName)} name={fieldName}>
                    <option value="">- Year -</option>
                </select>
            );
        },

        _isStripeLoaded: false,
        _getError: function(fieldName) {
            if (this.state.errors[fieldName]) {
                return <span className={cn(['message', 'error', 'appointment_fields'])}>
                    <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE000;' }} /> {Array.isArray(this.state.errors[fieldName]) ? this.state.errors[fieldName][0] : this.state.errors[fieldName]}
                </span>;
            } else {
                return null;
            }
        },

        _checkStripeValues: function(stripeValues) {
            if (!this._isStripeLoaded) {
                A.Popup.show('We are sorry.', 'Some scripts, needed for payment, has not been loaded. Please try again.');
                this.setState({'disabled': false});
                return false;
            }
            if (!window.Stripe || !window.Stripe.setPublishableKey) {
                A.Popup.show('We are sorry.', 'Scripts needed for payment has not been found.');
                this.setState({'disabled': false});
                return false;
            }

            var constraints  = {
                number: {
                    presence: true,
                    length: {is: 16}
                },
                cvc: {
                    presence: true,
                    length: {is: 3},
                    numericality: {onlyInteger: true}
                },
                exp_month: {
                    presence: true,
                    length: {is: 2},
                    numericality: {onlyInteger: true, lessThanOrEqualTo: 12, greaterThan: 0}
                },
                exp_year: {
                    presence: true,
                    length: {is: 4},
                    numericality: {onlyInteger: true}
                }
            };

            var errors = validate(stripeValues, constraints);
            this.setState({errors: (errors || {})});
            return (errors === undefined);
        },

        _getValues: function () {
            return {
                name: this.refs.name.value(),
                email: this.refs.email.value(),
                phone: this.refs.phone.value(),
                preferred_time: this.refs.datetime.value(),
                notes: this.refs.notes.value(),
                vehicle: this.state.values.vehicle
            };
        },

        _handleFormSubmit: function(event) {
            event.preventDefault();
            this.setState({'disabled': true});

            var stripeValues = {
                number: this.refs.card_number.value(),
                cvc: this.refs.cvc_number.value(),
                exp_month: this.refs.exp_month.value,
                exp_year: this.refs.exp_year.value 
            };

            if (this._checkStripeValues(stripeValues)) {
                var self = this;
                window.Stripe.setPublishableKey(this.state.stripeKey);
                window.Stripe.card.createToken(stripeValues, function(status, response) {
                    if (response.error) {
                        if (response.error.type === 'card_error') {
                            var errors = {};
                            errors[response.error.param] = [response.error.message];
                            self.setState({'errors': errors, 'disabled': false});
                        } else {
                            self.setState({'errors': {'global': [response.error.message]}, 'disabled': false});    
                        }
                    } else {
                        var values = {
                            token: response.id,
                            name: self.refs.name.value(),
                            email: self.refs.email.value(),
                            phone: self.refs.phone.value(),
                            preferred_time: self.refs.datetime.value(),
                            notes: self.refs.notes.value(),
                            vehicle_info: self._getVehicleInfo()
                        };

                        var payment = function() {
                            Api.orderPayment(self.state.order.order_id, values.token).then(function(response) {
                                self.setState({
                                    order: response
                                });
                                A.route('confirmation', {notice: response.notice}, false);
                            }).catch(function (errors) {
                                self.setState({
                                    errors: errors,
                                    disabled: false
                                })
                            });
                        };
                        if (self.state.status === 'incomplete') {
                            payment();
                        } else {
                            Api.orderCheckout(self.state.order.order_id, values).then(function (response) {
                                self.setState({
                                    status: response.status
                                });
                                payment();
                            }).catch(function (errors) {
                                self.setState({
                                    errors: errors,
                                    disabled: false
                                })
                            });
                        }
                    }
                });
            } else {
                this.setState({'disabled': false});
            }
        },

        _getVehicleInfo: function() {
            if (this.state.values.vehicle.trim) {
                return this.state.values.vehicle.year + ' ' + this.state.values.vehicle.make + ' ' + this.state.values.vehicle.model + ' ' + this.state.values.vehicle.trim;
            } else {
                return '';
            }
        },

        _vehicleChange: function(event) {
            var fields = ['year', 'make', 'model', 'trim'];
            var fieldName = event.target.name;
            var index = fields.indexOf(fieldName);

            var values = _.cloneDeep(this.state.values);
            values.vehicle[fieldName] = event.target.value;

            values.vehicle = {
                year: values.vehicle.year,
                make: index < 1 ? '' : values.vehicle.make,
                model: index < 2 ? '' : values.vehicle.model,
                trim: index < 3 ? '' : values.vehicle.trim
            };

            var self = this;

            Api.loadVehicleOptions(values.vehicle, fieldName).then(function(options) {
                self.setState({
                    options: options,
                    values: values
                })
            });
        }
    }

});