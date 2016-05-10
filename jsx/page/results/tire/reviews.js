define([
    'react',
    'reactDOM',
    'classnames',
    'lib/helper',
    'moment',
    'isMobile',
    'load!components/page/results/tire/stars',
    'actions/api',
    'lodash'
], function (
    React,
    ReactDOM,
    cn,
    h,
    moment,
    isMobile,
    Stars,
    Api,
    _
) {

    

    return {
        displayName: 'Reviews',

        getInitialState: function() {
            return {
                reviews: [],
                totalReviews: 0
            }
        },
 
        componentWillMount: function() {
            this._updateStateBaseOnProps(this.props);
        },

        componentDidMount: function() {
            this._init(this.props.load);
        },

        componentWillReceiveProps: function(nextProps) {
            this._updateStateBaseOnProps(nextProps);
            this._init(nextProps.load);
        },

        componentDidUpdate: function() {
            if (isMobile.any && this.state.scrollToTop && this.state.totalReviews) {
                // scroll to top of the component
                h.scrollToTop( ReactDOM.findDOMNode(this).parentNode , true );
                this.setState({
                    scrollToTop: false
                });
            }
        },

        shouldComponentUpdate: function(nextProps, nextState) {
            return nextState.reviews.length !== this.state.reviews.length || nextState.scrollToTop;
        },

        render: function() {
            if (!this.state.totalReviews) {
                return null;
            }

            var items = [];

            this.state.reviews.map(function(review, i) {
                items.push((
                    <div key={i} className={cn('result_review')}>
                        <h5 className={cn('result_review_title')}>{review.title}</h5>
                        <Stars rating={review.rating} />
                        <span className={cn('result_review_date')}>{moment(review.submitted_at).format('MMMM DD, YYYY')}</span>
                        <div className={cn('result_review_content')}>
                            <p dangerouslySetInnerHTML={{ __html: review.text }} />
                        </div>
                    </div>
                ));
            }.bind(this));

            if (this.state.reviews.length < this.state.totalReviews) {
                items.push(<a key="more" onClick={this._handleMoreClick} href="#more">Show more reviews</a>);
            }

            return (
                <div>
                    <h4 className={cn('result_reviews_heading')}><strong>{this.state.totalReviews}</strong> reviews:</h4>
                    {items}
                </div>
            );
        },

        _load: function (offset) {
            var self = this;
            var reviews = _.cloneDeep(self.state.reviews);
            Api.loadReviews(this.props.tireId, offset).then(function(data) {
                self.setState({
                    reviews: offset ? reviews.concat(data.reviews) : data.reviews,
                    totalReviews: data.nb_results
                });
            });
        },

        _init: function(need) {
            if (need && !this.state.totalReviews) {
                this._load(0);
            }
        },

        _updateStateBaseOnProps: function(props) {
            this.setState({
                scrollToTop: props.scrollToTop
            });
        },

        _handleMoreClick: function(event) {
            event.preventDefault();
            this._load(this.state.reviews.length);
        }

    }


});