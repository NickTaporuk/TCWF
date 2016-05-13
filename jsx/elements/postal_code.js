define([
    'react',
    'classnames'
], function(
    React,
    cn
) {

    return {
        getDefaultProps: function() {
            return {
                code:''
            }
        },
        render: function() {
            var postalCodeDiv = <div>
                                    <input type="text"/>
                                    <button onclick={this._getPostalCode()}>get PostalCode</button>
                                </div>;
            return postalCodeDiv;

        },
        _getPostalCode: function () {
            console.log('_getPostalCode:');
        }

    }
});