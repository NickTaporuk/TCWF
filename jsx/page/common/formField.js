define([
    'react',
    'classnames',
    'lodash',
    'components/datetime/DateTime',
    'load!components/elements/select'
], function(
    React,
    cn,
    _,
    DateTime,
    SelectField
) {
    return {
        getDefaultProps: function() {
            return {
                type: 'text',
                error: null,
                required: null,
                disabled: null,
                defaultValue: null,
                value: null,
                onChange: null,
                label: null,
                name: '',

                custom: {}
            }
        },

        render: function() {
            return  (
                <div className={cn('control_wrapper')}>
                    <div className={cn('row')}>
                        {this._label()}
                        {this._field()}
                    </div>
                    {this.props.error}
                </div>
            );
        },

        value: function() {
            if (this.props.type == 'datetime' || this.props.type == 'select') {
                return this.refs[this.props.name].value();    
            } else {
                return this.refs[this.props.name].value;
            }
        },

        _label: function() {
            var requireMark = this.props.required ? <span className="req">*</span> : null;
            var note = this.props.note ? <small className={cn('label_note')}>{this.props.note}</small> : null;

            return ( this.props.label
                ?   <label htmlFor={this._id()}>
                        {this.props.label + ' '} 
                        {requireMark}
                        {note}
                    </label>
                :   null
            );
        },

        _id: function() {
            return cn('field_' + this.props.name);
        },

        _field: function() {
            var field = null;

            var name = this.props.name;
            var type = this.props.type;

            var props = _.pickBy({
                id: this._id(),
                required: this.props.required,
                disabled: this.props.disabled,
                ref: name,
                name: name,
                defaultValue: this.props.defaultValue,
                value: this.props.value,
                onChange: this.props.onChange,
                required: this.props.required
            }, function(value) {
                return value !== null 
            });

            var custom = this.props.custom;

            switch (type) {
                case 'select':
                    field = <SelectField {...props} {...custom} withWrapper={false} />
                    break;

                case 'datetime':
                    field = <DateTime {...props} {...custom} />
                    break;

                case 'textarea':
                    field = <textarea {...props} {...custom} />
                    break;

                default:
                    field = <input {...props} {...custom} type={type} />
                    break;
            }
            return field;
        }
    }
});