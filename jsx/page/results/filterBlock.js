define([
    'react',
    'classnames',
    'lodash',
    'load!mixins/visibilityToggle'
], function(
    React,
    cn,
    _,
    visibilityToggle
) {

    return {
        mixins: [visibilityToggle],

        getInitialState: function() {
            return {
                isShown: false,
                checkedValues: [],
                allValues: [],

            }
        },

        getDefaultProps: function() {
            return {
                allDesc: 'All',
                defaultValue: [],
                topDirection: false
            }
        },

        componentWillMount: function() {
            this._setStateFromProps(this.props, true);
        },

        // componentWillReceiveProps: function(nextProps) {
        //     this._setStateFromProps(nextProps);
        // },
 
        shouldComponentUpdate: function(nextProps, nextState) {
            return this.state.checkedValues.length !== nextState.checkedValues.length || this.state.isShown !== nextState.isShown || nextProps.topDirection !== this.props.topDirection;
        },

        render: function() {
            var list = [];

            this.props.data.parameters.map(function(option, i) {
                list.push((
                    <li key={i}>
                        <label>
                            <input
                                type="checkbox"
                                name={this.props.name}
                                value={option.value}
                                onChange={this._handleFieldChange}
                                checked={ (this.state.checkedValues.indexOf(option.value) !== -1) }
                                disabled={ this.props.data.required_brands ? this.props.data.required_brands.indexOf(option.value) !== -1 : false }
                            />
                            {option.description + ' (' + option.count + ')'}
                        </label>
                    </li>
                ));
            }.bind(this));

            var allCheckbox = null;
            if (this.props.data.parameters.length > 1 && this.props.allDesc) {
                allCheckbox = <li>
                    <label className={cn('filters_all')}>
                        <input type="checkbox" defaultChecked={true} onClick={this._handleAllClick} /> {this.props.allDesc}
                    </label>
                </li>
            }

            return (
                <div className={cn('filters_wrapper')} onMouseDown={this._handleMouseDown} onMouseUp={this._handleMouseUp}>
                    <h4 className={cn('filters_title')} onMouseDown={this._handleToggleBtnMouseDown}>
                        <span>{ 'Filter by ' + this.props.by + ':'}</span>
                        <a href="javascript:;" className={cn(['toggle', 'filters_toggle'])}>
                            <i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: this.state.isShown ? '&#xE15B;' : '&#xE145;' }} />{'Toggle ' + this.props.by}
                        </a>
                    </h4>
                    <ul className={cn(['inputs_list', 'filters_list']) + ' ' + cn({toggle_hidden: !this.state.isShown, top_direction: this.props.topDirection})}>
                        {allCheckbox}
                        {list}
                    </ul>
                </div>
            );
        },

        _setStateFromProps: function(props, init) {
            var allValues = [];
            props.data.parameters.forEach(function(param, i) {
                allValues.push(param.value);
            }, this);

            var state = {
                allValues: allValues,
                checkedValues: props.defaultValue.length === 0 ? allValues : props.defaultValue
            };

            this.setState(state);
        },

        _handleFieldChange: function(event) {
            var value = event.target.value;
            if (!isNaN(parseInt(value))) {
                value = parseInt(value);
            }

            var checkedValues = _.cloneDeep(this.state.checkedValues);

            if (event.target.checked) {
                checkedValues.push(value);
            } else {
                _.remove(checkedValues, function(el) {
                    return el == value;
                });
            }

            this._checkValues(checkedValues);
        },

        _handleAllClick: function(event) {
            var checkedValues = _.cloneDeep(this.state.checkedValues);
            
            if (event.target.checked) {
                checkedValues = this.state.allValues;
            } else {
                checkedValues = [];    
            }

            this._checkValues(checkedValues);
        },

        _checkValues: function (checkedValues) {
            if (this.props.data.required_brands) {
                var requiredBrands = _.intersection(this.props.data.required_brands, this.state.allValues);
                checkedValues = _.union(checkedValues, requiredBrands);
            }

            this.setState({
                checkedValues: checkedValues
            });

            this.props.onChange(this.props.name, checkedValues);
        }
    }

});