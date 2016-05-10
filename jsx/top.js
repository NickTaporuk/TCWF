define([
    'react',
    'classnames', 
    'config',
    'actions/api',
    'promise'
], function(
    React,
    cn, 
    config,
    Api,
    Promise
) {

    return {
        displayName: 'Top',

        getInitialState: function() {
            return {
                ready: false
            }
        },

        componentDidMount: function() {
            var self = this;
            Promise.all([
                Api.loadDealerInfo(),
                Api.loadDealerConfig()
            ]).then(function (responses) {
                self.setState({
                    ready: true,
                    companyName: responses[0].company_name,
                    logo: responses[0].logo,
                    showTCLogo: responses[1].show_tireconnect_logo
                });
            });
        },

        render: function() {
            if (!this.state.ready) {
                return null;
            }

            if (config.sa) {
                return (
                    <div className={cn(['twelvecol', 'instore_header'])}>
                        <div className={cn(['sixcol', 'col_left'])}>
                            <img src={this.state.logo} alt={this.state.companyName} className={cn('instore_logo')} />
                            <a href={config.wlUrl + '/backend.php'} rel="nofollow" target="_blank">Account Login</a>
                        </div>
                        <div className={cn(['sixcol', 'last', 'col_right'])}>
                            <h3 className={cn('instore_title')}>{this.state.companyName}</h3>
                        </div>
                    </div>
                );
            } else {
                return this.state.showTCLogo ? <p className={cn('powered_by')}>Powered by <img src={config.imagesFolder + 'tireconnect-logo.png'} alt="TireConnect" /></p> : null;
            }
        }

        // _updateState: function() {
        //     if (config.sa) {
        //         this.setState({
        //             'companyName': dealerStore.getCompanyName(),
        //             'logo': dealerStore.getLogo()
        //         });
        //     }
        // },
    };

});