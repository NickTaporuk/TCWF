define([
    'react',
    'classnames',
    'moment'
], function (
    React,
    cn,
    moment
) {
    
    return {
        displayName: 'OfferInfo',

        getInitialState: function() {
            return {
                show: false
            };
        },

        render: function() {
            var tire = this.props.tire,
                block = null,
                offer = null;

            var rebates = tire.rebates;
            if (rebates && rebates[0] && rebates[0].valid_range) {
                offer = rebates[0];
            } else if (tire.discount) {
                offer = tire.discount;
                if (offer[0] !== undefined) { // needed as there are bug in response (if no discount we receive array. But it must be null)
                    offer = null;
                }
            }

            if (offer) {
                var link;
                if (offer.coupon_link && offer.coupon_line) {
                    link = <a target="_blank" rel="nofollow" href={offer.coupon_link}>{offer.coupon_line}</a>          
                }

                var range;
                if (!offer.valid_range.is_ongoing) {
                    range = 'Valid from ' + moment(offer.valid_range.start_date).format('MMM. DD') + ' to ' + moment(offer.valid_range.end_date).format('MMM. DD, YYYY') + '*';
                }

                var legalLine;
                if (offer.legal_link) {
                    legalLine = <span>{ offer.valid_range.is_ongoing ? '' : '*' }<a target="_blank" rel="nofollow" href={offer.legal_link} style={{color: offer.color }} dangerouslySetInnerHTML={ {__html: offer.legal_line} } /></span>;
                }
              
                block = (
                    <span className={cn(['result_rebate', 'tooltip'])}>
                        <a href="#show_rebate" onClick={this._handleShowClick} className={cn('toggle')}>{offer.name} <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: this.state.show ? '&#xE15C;' : '&#xE887;'}} /></a>

                        <span className={cn(['tooltip_content', 'toggle_content']) + ' ' + cn({toggle_hidden: !this.state.show})}>
                            <p>
                                {offer.description} {range ? <br /> : null}
                                {range} <br />
                                {link} {link ? <br /> : null}
                                {legalLine}
                            </p>
                        </span>
                    </span>
                );
            }

            return block;
        },

        _handleShowClick: function(event) {
            event.preventDefault();
            this.setState({
                show: !this.state.show
            });
        }
    }

})