define([
    'react',
    'classnames',
    'load!actions/act',
    'lib/helper',
    'config',
    'load!stores/appStore',
    'promise'
], function(
    React,
    cn,
    A,
    h,
    config,
    appStore,
    Promise
) {

    return {
        getInitialState: function() {
            return {
                ready: false
            }
        },

        componentDidMount: function() {
            var self = this;

            var summaryProps = appStore.getPageProps('summary');

            var tireParams = h.base64Decode(summaryProps.tire_id).split('||');
            var locationId = tireParams[3];

            // var locationId = appStore.getPageProps('results').location_id;

            Promise.all([
                Api.loadTire(summaryProps.tire_id),
                Api.loadQuote(summaryProps.tire_id, summaryProps.quantity, summaryProps.optional_services, summaryProps.with_discount, summaryProps.custom_discount),
                Api.loadLocation(locationId)
            ]).then(function(responses){
                self.setState({
                    ready: true,
                    tire: responses[0],
                    quote: responses[1],
                    location: responses[2],
                    order: appStore.getPageState('order').order
                })
            });
        },

        render: function() {
            if (!this.state.ready) {
                return null;
            }

            var tire = this.state.tire;
            var quote = this.state.quote;
            var order = this.state.order;
            var orderPrices = this.state.order.tires[0].prices;
            var location = this.state.location;

            var recyclingFee = null;
            if (quote.recycling_fee) {
                recyclingFee = <tr>
                    <td>{quote.recycling_fee.name}</td>
                    <td>${h.priceFormat(quote.recycling_fee.total_value)}</td>
                </tr>;
            }

            return (
                <div className={cn(['max_width', 'confirmation_wrapper'])}>
                    <h5 className={cn(['sixcol', 'confirmation_location'])}>
                        <span className={cn('confirmation_location_item')}><strong>{location.name}</strong></span>
                        <span className={cn('confirmation_location_item')}>{location.address_line_1 + ' ' + location.address_line_2}</span>
                        <span className={cn('confirmation_location_item')}>{location.city + ', ' +location.province + ', ' + location.postal_code}</span>
                        <span className={cn('confirmation_location_item')}>T: {location.phone}</span>
                    </h5>
                    <h2 className={cn(['sixcol', 'last', 'confirmation_number'])}>
                        ORDER #<span className={cn(['font_color', 'confirmation_number_value'])}>{order.order_number}</span>
                    </h2>
                    <div className={cn(['twelvecol', 'confirmation_summary'])}>
                        <div className={cn('table_wrapper')}>
                            <table className={cn('table')}>
                                <thead>
                                    <tr>
                                        <th>Tires</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{tire.brand + ' ' + tire.model}</td>
                                        <td>${h.priceFormat(tire.price)}</td>
                                        <td>{quote.tires_count}</td>
                                        <td>${h.priceFormat( quote.tires_count * tire.price )}</td>
                                    </tr>
                                    <tr>
                                        <td>{ tire.size_short + ' ' + tire.load_index + tire.speed_rating}</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td>{ 'Part #' + tire.part_number }</td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {this._getServicesBlock(quote.services)}
                        {this._getServicesBlock(quote.optional_services, true)}
                        {this._getDiscountBlock()}

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
                                    { recyclingFee && quote.recycling_fee.is_taxable ? recyclingFee : null }
                                    <tr>
                                        <td>{quote.tax.name}</td>
                                        <td>${h.priceFormat(quote.tax.total_value)}</td>
                                    </tr>
                                    { recyclingFee && quote.recycling_fee.is_taxable ? null : recyclingFee }
                                    <tr className={cn('dark')}>
                                        <td><sup dangerouslySetInnerHTML={{ __html: '&#8224;' }} />Total Price:</td>
                                        <td>${h.priceFormat(quote.total.price)}</td>
                                    </tr>
                                    <tr>
                                        <td>{ orderPrices.payment_percentage + '% Deposit Paid' }</td>
                                        <td>${h.priceFormat(orderPrices.deposit_payment)}</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td>Outstanding Balance:</td>
                                        <td>${h.priceFormat(orderPrices.outstanding_balance)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <p dangerouslySetInnerHTML={{ __html: quote.legal_information.replace(/(?:\r\n|\r|\n)/g, "<br />")}} />

                        <div className={cn(['twelvecol', 'bottom_btns'])}>
                            <a href="#search" onClick={this._handleToStartClick} className={cn(['brand_btn_light', 'btn_small', 'left'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} /> Start over</a>
                            <a href="#print" onClick={this._handelPrintClick} className={cn(['brand_btn_light', 'btn_small', 'right'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8AD;' }} /> Print this page</a>
                        </div>
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

            servicesInfo.map(function(info, i) {
                if (!isOptional || info.applied) {
                    services.push((
                        <tr key={i}>
                            <td>
                                {info.name}
                                <small>{info.description}</small>
                            </td>
                            <td>${h.priceFormat(info.total_price)}</td>
                        </tr>
                    ));
                }
            }.bind(this));

            if (services.length == 0) {
                return null;
            }

            return <div className={cn('table_wrapper')}>
                <table className={cn('table')}>
                    <thead>
                        <tr>
                            <th>{isOptional ? 'Optional Services' : 'Installation'}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {services}
                    </tbody>
                </table>
            </div>
        },

         _getDiscountBlock: function() {
            var discount = this.state.quote.discount && this.state.quote.discount.applied ? this.state.quote.discount.total_value : null;
            if (!discount) {
                return null;
            }

            return (
                <div className={cn('table_wrapper')}>
                    <table className={cn('table')}>
                        <thead>
                            <tr>
                                <th>Discount</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Discount</td>
                                <td>${h.priceFormat(discount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        },

        _handleToStartClick: function(event) {
            event.preventDefault();
            A.route('search');
        },

        _handelPrintClick: function(event) {
            event.preventDefault();
            var el = window.document.getElementById(cn('widget'));
            h.printHtml(el.outerHTML, [config.mainCss]);
        }
    }

});