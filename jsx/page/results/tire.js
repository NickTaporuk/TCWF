define([
    'react',
    'config',
    'classnames',
    'load!actions/act',
    'lib/helper',
    'load!components/page/results/tire/offerInfo',
    'load!components/page/results/tire/reviews',
    'load!components/page/results/tire/stock',
    'load!components/page/results/tire/stars'
], function(
    React,
    config,
    cn,
    A,
    h,
    OfferInfo,
    Reviews,
    Stock,
    Stars
) {

    return {
        displayName: 'Tire',

        getInitialState: function() {
            return {
                activeTab: 'specs',
                supplier: null
            }
        },

        componentWillMount: function() {
            this._extendTire(this.props.tire);
            this.setState({
                selQuantity: this.props.tire.selected_quantity,
                quantity: this.props.tire.quantity,
                price: this.props.tire.price,
                isInStock: this.props.tire.is_in_stock
            });
        },

        render: function() {
            var tire = this.props.tire;

            var tab = this.state.activeTab;
            var warranty = this.props.isInMile ? tire.mileage_rating : tire.kilometer_rating;

            var features = null;
            if (tire.description) {
                var items = [];
                tire.description.map(function(desc, i){
                    if (typeof desc === 'object') {
                        items.push(<h5 key={i+'h'}>{desc.feature}</h5>);
                        items.push(<p key={i+'d'}>{desc.benefit}</p>);
                    } else {
                        items.push(<li key={i}>{desc}</li>);
                    }
                });
                features = <div className={cn('tab_cont')} aria-hidden={!(tab == 'features')}><ul>{items}</ul></div>;
            }

            var quantityItems = [];
            for(var q = 1; q <= this.state.quantity && q <= 8; q++) {
                quantityItems.push(<option key={q} value={q}>{q}</option>);
            }

            return (
                <li className={cn({result: true, result_featured: this.props.isTop, border_color: this.props.isTop})}>
                    <div className={cn('result_header')}>
                        <h3 className={cn(['result_title', 'font_color'])}>
                            {tire.model}
                            <span className={cn('result_subtitle')}>
                                <span className={cn('result_type')}>{tire.category}</span>
                                <span className={cn('warranty')}>Warranty: <strong className={cn('warranty_value')}>{warranty ? warranty : 'NA'}</strong> {warranty ? (this.props.isInMile ? 'mi' : 'km') : null}</span>
                            </span>
                        </h3>
                        {/*<label className={cn('result_compare')}>
                            <input type="checkbox" defaultChecked={false} /> Add to compare
                        </label>*/}
                    </div>
                    <div className={cn('result_body')}>
                        <div className={cn('result_left')}>
                            <img src={tire.brand_logo} alt={tire.brand + ' Tire'} className={cn('result_brand_logo')} />
                            <div className={cn('result_tire_wrapper')}>
                                <img src={tire.image} alt="An image of the tire" className={cn('result_tire')} />
                                {
                                    this.props.tire.external_info.marketing.images.length > 0
                                    ?   <a href="#tire_img" onClick={this._handleEnlargeClick} className={cn(['modal_open', 'tire_enlarge', 'font_color'])}>
                                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE147;'}} /><span className={cn('hidden')}>Enlarge</span>
                                        </a>
                                    :   null
                                }
                            </div>
                            <OfferInfo tire={this.props.tire} />
                            {this._getOemBlock()}
                            {this._getRatingBlock()}
                        </div>
                        <div className={cn('result_right')}>
                            { this.props.tire.external_info.marketing.statement
                                ?   <div className={cn('result_intro')}>
                                        <p>{this.props.tire.external_info.marketing.statement}</p>
                                    </div>
                                :   null
                            }
                            <div className={cn('result_select_actions')}>
                                <div className={cn('result_price_wrapper')}>
                                    <div className={cn('result_price')}>
                                        <label className={cn('qty')}>
                                            <span className={cn('qty_label')}>Qty:</span>
                                            <select name={cn('qty_result_1')} onChange={this._handleQuantityChange} value={this.state.selQuantity} ref="quantity">
                                                {quantityItems}
                                            </select>
                                        </label>
                                        <h5 className={cn('price')}>
                                            <strong className={cn('price_value')}>{this.state.price ? '$' + h.priceFormat(this.state.price * this.state.selQuantity) : null}</strong>
                                        </h5>
                                    </div>
                                </div>
                                <div className={cn('select_btn_wrapper')}>
                                    { this.state.price
                                        ? <a href="#summary" onClick={this._handleSelectClick} className={cn(['btn', 'brand_btn', 'select_btn'])}>Select Tire <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C8;' }} /></a>
                                        : <a href="#summary" onClick={this._handleGetQuoteClick} className={cn(['btn', 'brand_btn', 'select_btn'])}>Get a quote</a>
                                    }
                                </div>
                            </div>
                            <div className={cn(['tabs', 'result_tabs'])}>
                                <ul>
                                    <li className={cn('tab')}><a href="#specs" onClick={this._handleTabClick.bind(this, 'specs')} className={cn('font_color')} aria-selected={(tab == 'specs')}>Specs</a></li>
                                    {
                                        features
                                        ? <li className={cn('tab')}><a href="#features" onClick={this._handleTabClick.bind(this, 'features')} className={cn('font_color')} aria-selected={(tab == 'features')}>Features</a></li>
                                        : null
                                    }
                                    {   
                                        this.props.tire.external_info.rating.total_reviews
                                        ? <li className={cn('tab')}><a href="#reviews" ref="reviews" onClick={this._handleTabClick.bind(this, 'reviews')} className={cn('font_color')}  aria-selected={(tab == 'reviews')}>Reviews</a></li>
                                        : null
                                    }
                                    {
                                        config.sa
                                        ? <li className={cn({tab: true, stock_tab: true, in_stock: this.state.isInStock})} role="presentation">
                                            <a href="#stock" onClick={this._handleTabClick.bind(this, 'stock')} aria-selected={(tab == 'stock')}>{this.state.isInStock ? 'In-Stock' : 'Stock'}</a>
                                        </li>
                                        : null
                                    }
                                </ul>
                                <div className={cn('tab_cont')} aria-hidden={!(tab == 'specs')}>
                                    <ul className={cn('result_specs_list')}>
                                        <li>Size: <strong className={cn('result_spec_value')}>{tire.size_short}</strong></li>
                                        <li>Speed Rating: <strong className={cn('result_spec_value')}>{tire.speed_rating}</strong></li>
                                        <li>Load Index: <strong className={cn('result_spec_value')}>{tire.load_index}</strong></li>
                                        <li>Sidewall: <strong className={cn('result_spec_value')}>{tire.side_wall_style}</strong></li>
                                        <li>Part: <strong className={cn('result_spec_value')}>{tire.part_number}</strong></li>
                                    </ul>
                                </div>
                                {features}
                                { 
                                    this.props.tire.external_info.rating.total_reviews 
                                    ? <div className={cn('tab_cont')} aria-hidden={!(tab == 'reviews')}>
                                        <Reviews tireId={tire.id} scrollToTop={tab == 'reviews'} load={tab == 'reviews'} />
                                    </div>
                                    : null
                                }
                                {
                                    config.sa
                                    ? <div className={cn('tab_cont')} aria-hidden={!(tab == 'stock')}>
                                        <Stock tire={tire} onSupplierChange={this._onSupplierChange} load={tab == 'stock'} />
                                    </div>
                                    : null
                                }
                            </div>
                        </div>
                    </div>
                </li>
            );
        },

        _extendTire: function (tire) {
            if (!tire.external_info) {
                tire.external_info = {
                    marketing: {},
                    rating: {}
                };
            }

            if (!tire.external_info.marketing) {
                tire.external_info.marketing = {
                    images: [],
                    statement: ''
                };
            } else if (tire.external_info.marketing.features && tire.external_info.marketing.features.length > 0) {
                tire.description = tire.external_info.marketing.features;
            }

            if (!tire.external_info.marketing.images) {
                tire.external_info.marketing.images = [];
            }

            if (!tire.external_info.rating) {
                tire.external_info.rating = {
                    total_reviews: null,
                    average_rating: null
                };
            }

            if (tire.category == 'Not Defined') {
                tire.category = 'Undefined Category';
            }

            var quantity = 4;
            tire.selected_quantity = quantity <= tire.quantity ? quantity : tire.quantity;

            // tire.is_in_stock = (showInStock && tire.is_in_stock);
        },

        _getRatingBlock: function(rating, totalRevuew) {
            var info = this.props.tire.external_info;
            var rating = info.rating.average_rating;
            if (!rating) {
                return null;
            }

            var totalReviews = null
            if (info.rating.total_reviews) {
                totalReviews = info.rating.total_reviews;
            }

            return (
                <div>
                    <Stars rating={rating} />
                    <a href="#reviews" onClick={this._handleTabClick.bind(this, 'reviews')}>{totalReviews + ' Reviews'}</a>
                </div>
            );
        },

        _getOemBlock: function() {
            var tire = this.props.tire,
                block;

            if (tire.is_oem) {
                block = (
                    <span className={cn('result_original_equip')}>
                        Original Equipment Tire
                    </span>
                );
            }

            return block;
        },

        _handleTabClick: function(tab, event) {
            if (event) {
                event.preventDefault();
            }

            this.setState({
                activeTab: tab
            });
        },
        
        _onSupplierChange: function(supplier, event) {
            this.setState({
                price:  supplier.price,
                quantity: supplier.quantity,
                selQuantity: supplier.quantity < this.state.selQuantity ? parseInt(supplier.quantity) : this.state.selQuantity,
                isInStock: supplier.is_in_stock,
                supplier: supplier
            });
        },

        _handleQuantityChange: function() {
            this.setState({
                selQuantity: parseInt(this.refs.quantity.value)
            });
        },

        _handleSelectClick: function(event) {
            event.preventDefault();
            A.route('summary', {
                quantity: this.state.selQuantity,
                tire_id: this.state.supplier ? this.state.supplier.tire_id : this.props.tire.id,
                with_discount: this.props.tire.discount && this.props.tire.discount.added_by_default
            });
        },

        _handleGetQuoteClick: function(event) {
            event.preventDefault();
            A.route('quote_form', {
                type: 'request',
                tire_id: this.state.supplier ? this.state.supplier.tire_id : this.props.tire.id,
                quantity: this.state.selQuantity
            });
        },

        _handleEnlargeClick: function(event) {
            event.preventDefault();
            A.popup.show(
                this.props.tire.model,
                <img src={this.props.tire.external_info.marketing.images[0]} />
            );
            //Act.Tire.enlargeImage(this.props.tire.external_info.marketing.images[0], this.props.tire.model);
        }
    }


});