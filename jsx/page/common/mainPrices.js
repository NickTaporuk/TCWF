define([
    'react', 
    'classnames',
    'lib/helper'
], function(
    React, 
    cn,
    h
) {



    return {


        render: function() {
            var quote = this.props.quote;


            var recyclingFee = null;
            if (quote.recycling_fee) {
                recyclingFee = <tr>
                    <td>{quote.recycling_fee.name}</td>
                    <td>${h.priceFormat(quote.recycling_fee.total_value)}</td>
                </tr>;
            }

            return (
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

                            {
                                quote.discount && quote.discount.applied
                                ?   <tr>
                                        <td>Discount</td>
                                        <td>${h.priceFormat(quote.discount.total_value)}</td>
                                    </tr> 
                                :   null
                            }

                            { recyclingFee && quote.recycling_fee.is_taxable ? recyclingFee : null }
                            
                            <tr>
                                <td>{quote.tax.name}</td>
                                <td>${h.priceFormat(quote.tax.total_value)}</td>
                            </tr>

                            { recyclingFee && quote.recycling_fee.is_taxable ? null : recyclingFee }
                        </tbody>
                        <tfoot>
                            <tr className={cn('light')}>
                                <td>Total Price:</td>
                                <td>${h.priceFormat(quote.total.price)}</td>
                            </tr>

                            {
                                this.props.order
                                ?   <tr>
                                        <td>What you pay today:</td>
                                        <td>${h.priceFormat(this.props.order.tires[0].prices.deposit_payment)}</td>
                                    </tr>
                                :   null
                            }

                            {   this.props.order
                                ?   <tr className={cn('light')}>
                                        <td>Outstanding Balance:</td>
                                        <td>${h.priceFormat(this.props.order.tires[0].prices.outstanding_balance)}</td>
                                    </tr>
                                :   null
                            }
                        </tfoot>
                    </table>
                </div>
            );
        }

    }

});