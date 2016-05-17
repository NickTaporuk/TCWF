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
                visibleValidateCode     : 'none'
            }
        },
        render: function() {
            console.log('text validate:',this.state.visibleValidateCode);
            var postalCodeDiv = <div >
                                    <label style={{ display: this.state.visibleValidateCode , color: "#E62828"}}>{this.state.postCodeValidateText}</label>
                                    <label htmlFor="post-code">Enter post code:</label>
                                    <input id="post-code" type="text"  onBlur={this._getInputPostal} style={{ border: this.state.inputBackground }} />
                                </div>;
            return postalCodeDiv;
        },
        _getPostalCode: function () {
            //add validate
            this.props.postalcode(this.state.code);
        },
        _getInputPostal: function(e){
            var self        = this,
                regexPost   = this.props.regex,
                state,
                text = '';

            if(regexPost.test(e.target.value)){
                Promise.all([
                    Api.loadPostalLocations(e.target.value)
                ]).then(function (response) {
                    if(response[0].results.length > 0) {
                        self.props.postalcode(response);
                        text = self.state.successText;
                        state = self.state.background.success;
                        self.setState({
                            inputBackground : state,
                            visibleValidateCode : 'block',
                            postCodeValidateText: text

                        });
                    } else {
                        lockr.set('location_id', false);
                        state = self.state.background.err;
                        text = self.state.errorText;
                        self.setState({
                            inputBackground     : state,
                            code                : '',
                            visibleValidateCode : 'block',
                            postCodeValidateText: text
                        });
                    }
                });


                text = self.state.successText;
                state = self.state.background.success;
                self.setState({
                    code : e.target.value,
                    inputBackground : state,
                    visibleValidateCode : 'block',
                    postCodeValidateText: text

                });
            } else {
                state = self.state.background.err;
                text = self.state.errorText;
                self.setState({
                    inputBackground     : state,
                    code                : '',
                    visibleValidateCode : 'block',
                    postCodeValidateText: text
                });
            }
        }

    }
});