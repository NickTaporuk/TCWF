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
                code            : '',
                validateState   : false,
                regex           : /^\d{5,9}$/,
            }
        },
        getInitialState: function() {
            return {
                background : {
                    success     : "1px solid #0FF115",
                    err       : "1px solid #E62828"
                },
                inputBackground: "1px solid #a0a0a0"
            }
        },
        render: function() {
            var postalCodeDiv = <div >
                                    <input type="text" onChange={this._getInputPostal} style={{ border: this.state.inputBackground}}/>
                                    <button onClick={this._getPostalCode}>getPostalCode</button>
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
                state;
            console.log(regexPost.test(e.target.value))    ;
            if(regexPost.test(e.target.value)){
                state = self.state.background.success;
                self.setState({
                    code : e.target.value,
                    inputBackground : state
                });
            } else {
                state = self.state.background.err;
                self.setState({
                    inputBackground : state,
                    code            : ''
                });
            }
        }

    }
});