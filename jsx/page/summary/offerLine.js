define([
    'react',
    'classnames',
    'lib/helper',
    'config',
    'moment'
], function(
    React,
    cn,
    h,
    config,
    moment 
) {

    return {
        render: function() {
            var offer = this.props.offer;
            if (!offer) {
                return null;
            }
            return (
                <tr className={cn(this.props.type + '_row')} style={{backgroundColor: offer.background}}>
                    <td colSpan="3" className={cn('nested_wrapper')}>
                        <table className={cn('toggle_table')} style={{color: offer.color }}>
                            <tbody>
                                <tr>
                                    {this._getButton()}
                                    <td>
                                        {this._getValueBlock()}
                                        <strong>{offer.name}</strong><br />
                                        <span dangerouslySetInnerHTML={{ __html: offer.description.replace(/(?:\r\n|\r|\n)/g, "<br />") }} /><br />
                                        {this._getValidRange()}
                                        {this._getMinQualifuer()}
                                        {this._getLegalLine()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            );
        },

        _getValueBlock: function() {
            var offer = this.props.offer;
            var type = this.props.type;
            if (offer.is_active) {
                // generate coupon link and offer amount if offer is active:

                var showValue = (type == 'discount' || offer.effective);  //if rebate has no effective price value should not be displayed.

                var valueBlock = null,
                    valueHeader = null;
                if (showValue) {

                    var valueHeader = type == 'discount' ? 'Discount' : (showValue ? 'Effective Price' : null);
                    if (valueHeader) {
                        valueHeader = <strong>{valueHeader}</strong>;
                    }

                    if (type == 'rebate' || !config.sa || !offer.editable) {
                        var valueToShow = h.priceFormat( offer.effective ? offer.effective : offer.total_value ); // discount has no effective price
                        valueBlock = <h4>{ '$'  + valueToShow }</h4>;
                    } else {
                        valueBlock = <span className={cn('dollar_field')}>
                            <span className={cn('dollar_label')}>$</span><input key={Date.now()} type="number" type="number" onBlur={this._handleDiscountChange} defaultValue={ offer.total_value } />
                        </span>;
                    }
                }

                var couponLink = null;
                if (offer.coupon_link && offer.coupon_line) {
                    couponLink = <a href={offer.coupon_link} rel="nofollow" className={cn(['brand_btn', 'btn_small'])} target="_blank">{offer.coupon_line}</a>;
                }

                if (valueHeader || valueBlock || couponLink) {
                    whiteBlock = <div className={cn({'no_value': !showValue, 'discount_wrapper': true})}>
                        {valueHeader}
                        {valueBlock}
                        {couponLink}
                    </div>;
                } else {
                    whiteBlock = null;
                }

            } else {
                // generate message if offer is not active:
                var msgOfferSpend = '', msgOfferVal = '', msgOfferSpendMoreDef = '';
                if (offer.minimum_qualifiers.amount) {
                    msgOfferSpend = 'Spend $' + offer.minimum_qualifiers.amount + ' ';
                    if (offer.minimum_qualifiers.pre_tax && offer.minimum_qualifiers.with_disposal_fee) {
                        msgOfferSpend += 'before taxes,';
                        msgOfferSpendMoreDef = 'but including fees';
                    } else if (offer.minimum_qualifiers.pre_tax && !offer.minimum_qualifiers.with_disposal_fee) {
                        msgOfferSpend += 'before taxes';
                    } else if (!offer.minimum_qualifiers.pre_tax && offer.minimum_qualifiers.with_disposal_fee) {
                        msgOfferSpend += 'after taxes and fees'
                    } else if (!offer.minimum_qualifiers.pre_tax && !offer.minimum_qualifiers.with_disposal_fee) {
                        msgOfferSpend += 'after taxes';
                    }
                } else {
                    msgOfferSpend = 'Purchase ' + offer.minimum_qualifiers.quantity + ' tires ';
                }
                if (offer.rate) {
                    msgOfferVal = 'to receive ' + offer.rate + '% ' + type + '.';
                } else {
                    var value = offer.per_tire ? offer.value : offer.total_value; // rebate need only total value and rebate have no per_tire option
                    msgOfferVal = 'to receive $' + value + ' ' + type + (offer.per_tire ? ' per tire.' : '.');
                }
                whiteBlock = <div className={cn('discount_wrapper')}>
                    <strong>
                        {msgOfferSpend}<br />
                        {msgOfferSpendMoreDef}{msgOfferSpendMoreDef ? <br /> : null}
                        {msgOfferVal}
                    </strong>
                </div>;

            }

            return whiteBlock;
        },

        _getButton: function() {
            var offer = this.props.offer;
            var type = this.props.type;

            var btn = null;
            if (type === 'discount') {
                btn = offer.is_active 
                    ?   <td className={cn('toggle_cell')}>
                            <button onClick={this._handleDiscountClick} className={cn({toggle_cell_btn: true, toggle_remove: offer.applied, toggle_add: !offer.applied})}>
                                <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: (offer.applied ? '&#xE15C;' : '&#xE147;') }} /><span>{ offer.applied ? 'Remove' : 'Add' }</span>
                            </button>
                        </td>
                    :   null;
            }

            return btn;
        },

        _getValidRange: function() {
            var offer = this.props.offer;
            var validRange = null;
            if (!offer.valid_range.is_ongoing) {
                validRange = <span>{'Offer valid from ' + moment(offer.valid_range.start_date).format('MMM. DD') + ' - ' + moment(offer.valid_range.end_date).format('MMM. DD, YYYY') +  '.' + (offer.legal_link ? '*' : '') }<br /></span>
            }

            return validRange;
        },

        _getLegalLine: function() {
            var offer = this.props.offer;
            var legalLine = null;
            if (offer.legal_link) {
                legalLine = <small>{ offer.valid_range.is_ongoing ? '' : '*' }<a target="_blank" rel="nofollow" href={offer.legal_link} style={{color: offer.color }} dangerouslySetInnerHTML={ {__html: offer.legal_line} } /></small>;
            }

            return legalLine;
        },

        _getMinQualifuer: function() {
            var offer = this.props.offer;
            var minQualifuerText = null;
            if (!(offer.minimum_qualifiers.amount === 0 || offer.minimum_qualifiers.quantity <= 1)) {
                minQualifuerText = <small>{'Minimum of ' + (offer.minimum_qualifiers.amount ? '$' + offer.minimum_qualifiers.amount : offer.minimum_qualifiers.quantity + ' tire') + ' purchase required.'}<br /></small>;
            }

            return minQualifuerText;
        },

        _handleDiscountClick: function(event) {
            event.preventDefault();
            this.props.onClick(event);
        },

        _handleDiscountChange: function(event) {
            event.preventDefault();
            this.props.onChange(event);
        }
    }

});