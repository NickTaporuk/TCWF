define([
    'react',
    'actions/api',
    'promise',
    'lockr',

], function(
    React,
    Api,
    Promise,
    lockr
) {

    return {
        getDefaultProps: function() {
            return {
                validateState   : false,
                regex           : /(^\d{5}(-\d{4})?$)|(^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$)/i,
            }
        },
        getInitialState: function() {
            return {
                background : {
                    success     : "1px solid #0FF115",
                    err         : "1px solid #E62828"
                },
                inputBackground         : "1px solid #a0a0a0",
                errorText               : 'Zip Code is not defined',
                successText             : 'Zip Code is correct',
                postCodeValidateText    : '',
                visibleValidateCode     : 'none',
                colorValidateSuccess    : '#0FF115',
                colorValidateError      : '#E62828',
                colorValidate           : '',
            }
        },
        render: function() {
            var postalCodeDiv = <div >
                                    <label style={{ display: this.state.visibleValidateCode , color: this.state.colorValidate }}>{this.state.postCodeValidateText}</label>
                                    <label htmlFor="post-code">Enter post code:</label>
                                    <input id="post-code" type="text"  onChange={this._getInputPostal} style={{ border: this.state.inputBackground }} />
                                </div>;
            return postalCodeDiv;
        },
        _getInputPostal: function(e){
            var self        = this,
                regexPost   = this.props.regex;

            if(regexPost.test(e.target.value)){
                Promise.all([
                    Api.loadPostalLocations(e.target.value)
                ]).then(function (response) {
                    if(response[0].results.length > 0) {

                        self.props.postalcode(response);
                        self._successValidate();
                    } else {
                        lockr.set('location_id', false);
                        self._errorValidate();
                    }
                });

                self._successValidate();
            } else {
                self.props.postalcode(false);

                self._errorValidate();
            }
        },
        _successValidate: function(){
            var self = this,
                text = self.state.successText,
                state = self.state.background.success,
                color = self.state.colorValidateSuccess;

            self.setState({
                inputBackground     : state,
                visibleValidateCode : 'none',
                postCodeValidateText: text,
                colorValidate       : color

            });

        },
        _errorValidate: function(){
            var self = this,
                state = self.state.background.err,
                text = self.state.errorText,
                color = self.state.colorValidateError;

            self.setState({
                inputBackground     : state,
                code                : '',
                visibleValidateCode : 'block',
                postCodeValidateText: text,
                colorValidate       : color
            });
        }
    }
});