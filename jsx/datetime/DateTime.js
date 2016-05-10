define(['react', './src/DaysView', 'moment', 'lodash', 'config'], //'./src/onClickOutside', './src/MonthsView', './src/YearsView', './src/TimeView'
	function(React, DaysView, moment, _, config) { // onClickOutside, MonthsView, YearsView, TimeView, 

	var TYPES = React.PropTypes;
	var Datetime = React.createClass({
		mouseIsDownHere: false,
		componentDidMount: function () {
		    window.addEventListener('mousedown', this._handleShowOptions, false);
		},
		componentWillUnmount: function() {
			window.removeEventListener('mousedown', this._handleShowOptions, false);
		},
		_handleShowOptions: function() {
			if (this.mouseIsDownHere) {
		  		this.setState({open: true});
		    	return;
		  	}
		  	this.setState({open: false});
		  	// this.props.onBlur( this.state.selectedDate || this.state.inputValue );
			//this.setState({ open: false });
		},
		_mouseDownHandler: function() {
			this.mouseIsDownHere = true;
		},
		_mouseUpHandler: function() {
			this.mouseIsDownHere = false;
		},



		// mixins: [
		// 	onClickOutside
		// ],
		viewComponents: {
			days: DaysView
			// months: MonthsView,
			// years: YearsView,
			// time: TimeView
		},
		propTypes: {
			// value: TYPES.object | TYPES.string,
			// defaultValue: TYPES.object | TYPES.string,
			onBlur: TYPES.func,
			onChange: TYPES.func,
			locale: TYPES.string,
			input: TYPES.bool,
			// dateFormat: TYPES.string | TYPES.bool,
			// timeFormat: TYPES.string | TYPES.bool,
			inputProps: TYPES.object,
			viewMode: TYPES.oneOf(['years', 'months', 'days', 'time']),
			isValidDate: TYPES.func,
			open: TYPES.bool,
			strictParsing: TYPES.bool
		},

		getDefaultProps: function() {
			var nof = function(){};
			return {
				className: '',
				defaultValue: '',
				viewMode: 'days',
				inputProps: {},
				input: true,
				onBlur: nof,
				onChange: nof,
				timeFormat: true,
				dateFormat: true,
				strictParsing: true,
				useAMPM: true,
				prefix: config.prefix
			};
		},

		getInitialState: function() {
			var state = this.getStateFromProps( this.props );

			if( state.open == undefined )
				state.open = !this.props.input;

			state.currentView = this.props.dateFormat ? this.props.viewMode : 'time';

			return state;
		},

		getStateFromProps: function( props ){
			var formats = this.getFormats( props ),
				date = props.value || props.defaultValue,
				selectedDate, viewDate
			;

			if( date && typeof date == 'string' )
				selectedDate = this.localMoment( date, formats.datetime );
			else if( date )
				selectedDate = this.localMoment( date );

			if( selectedDate && !selectedDate.isValid() )
				selectedDate = null;

			viewDate = selectedDate ?
				selectedDate.clone().startOf("month") :
				this.localMoment().startOf("month")
			;

			return {
				inputFormat: formats.datetime,
				viewDate: viewDate,
				selectedDate: selectedDate,
				inputValue: selectedDate ? selectedDate.format( formats.datetime ) : (date || ''),
				open: props.open != undefined ? props.open : this.state && this.state.open
			};
		},

		value: function() {
			return this.state.inputValue;
		},

		getFormats: function( props ){
			var formats = {
					date: props.dateFormat || '',
					time: props.timeFormat || ''
				},
				locale = this.localMoment( props.date ).localeData()
			;

			if( formats.date === true ){
				formats.date = locale.longDateFormat('L');
			}
			if( formats.time === true ){
				formats.time = locale.longDateFormat('LT');
			}

			formats.datetime = formats.date && formats.time ?
				formats.date + ' ' + formats.time :
				formats.date || formats.time
			;

			return formats;
		},

		componentWillReceiveProps: function(nextProps) {
			var formats = this.getFormats( nextProps ),
				update = {}
			;

			if( nextProps.value != this.props.value ){
				update = this.getStateFromProps( nextProps );
			}
			if ( formats.datetime !== this.getFormats( this.props ).datetime ) {
				update.inputFormat = formats.datetime;
			}

			this.setState( update );
		},

		onInputChange: function( e ) {
			var value = e.target == null ? e : e.target.value,
				localMoment = this.localMoment( value, this.state.inputFormat ),
				update = { inputValue: value }
			;

			if ( localMoment.isValid() && !this.props.value ) {
				update.selectedDate = localMoment;
				update.viewDate = localMoment.clone().startOf("month");
			}
			else {
				update.selectedDate = null;
			}

			return this.setState( update, function() {
				return this.props.onChange( localMoment.isValid() ? localMoment : this.state.inputValue );
			});
		},

		showView: function( view ){
			var me = this;
			return function( e ){
				me.setState({ currentView: view });
			};
		},

		setDate: function( type ) {
			var me = this,
				nextViews = {
					month: 'days',
					year: 'months'
				}
			;
			return function( e ){
				me.setState({
					viewDate: me.state.viewDate.clone()[ type ]( parseInt(e.target.getAttribute('data-value')) ).startOf( type ),
					currentView: nextViews[ type ]
				});
			};
		},

		addTime: function( amount, type, toSelected ){
			return this.updateTime( 'add', amount, type, toSelected );
		},

		subtractTime: function( amount, type, toSelected ){
			return this.updateTime( 'subtract', amount, type, toSelected );
		},

		updateTime: function( op, amount, type, toSelected ){
			var me = this;

			return function(){
				var update = {},
					date = toSelected ? 'selectedDate' : 'viewDate'
				;

				update[ date ] = me.state[ date ].clone()[ op ]( amount, type );

				me.setState( update );
			};
		},

		allowedSetTime: ['hours','minutes','seconds', 'milliseconds'],
		onChange: function(date) {
			date.target = {};
			if (this.props.inputProps.name) {
				date.target.name = this.props.inputProps.name;
			}
			date.target.value = date.format( this.state.inputFormat );
			this.props.onChange( date );
		},
		setTime: function( type, value ){
			var state = this.state,
				date = (state.selectedDate || state.viewDate).clone()
			;

			if (this.props.useAMPM) {
				if (type == 'meridiem') {
					type = 'hours';
					if (value == 'am') {
						value = date.hours() >= 12 ? date.hours() - 12 : date.hours();
					} else {	
						value = date.hours() <= 12 ? date.hours() + 12 : date.hours();
					}
				} else if (type == 'hours') {
					if (date.format('a') == 'pm' && parseInt(value) < 12) {
						value = parseInt(value) + 12;
					} else if (date.format('a') == 'am' && parseInt(value) >= 12)  {
						value = parseInt(value) - 12;
					}
				}
			}

			var index = this.allowedSetTime.indexOf( type ) + 1,
				nextType
			;

			// It is needed to set all the time properties
			// to not to reset the time
			date[ type ]( value );
			for (; index < this.allowedSetTime.length; index++) {
				nextType = this.allowedSetTime[index];
				date[ nextType ]( date[nextType]() );
			}

			if( !this.props.value ){
				this.setState({
					selectedDate: date,
					inputValue: date.format( state.inputFormat )
				});
			}

			this.onChange(date);
		},

		updateSelectedDate: function( e ) {
			var target = e.target,
				modifier = 0,
				viewDate = this.state.viewDate,
				currentDate = this.state.selectedDate || viewDate,
				date
			;

			if(target.className.indexOf( this.props.prefix + "rdtNew") != -1)
				modifier = 1;
			else if(target.className.indexOf( this.props.prefix + "rdtOld") != -1)
				modifier = -1;

			date = viewDate.clone()
				.month( viewDate.month() + modifier )
				.date( parseInt( target.getAttribute('data-value') ) )
				.hours( currentDate.hours() )
				.minutes( currentDate.minutes() )
				.seconds( currentDate.seconds() )
				.milliseconds( currentDate.milliseconds() )
			;

			if( !this.props.value ){
				this.setState({
					selectedDate: date,
					viewDate: date.clone().startOf('month'),
					inputValue: date.format( this.state.inputFormat )
				});
			}

			this.onChange(date);
		},

		openCalendar: function() {
			// var event = new Event('blur');
			// this.refs.input.dispatchEvent(event);

			this.setState({ open: true });
		},

		closeCalendar: function(e) {
			if (typeof e == 'object') {
				e.preventDefault();
			}
			this.setState({ open: false });
		},

		// handleClickOutside: function(){
		// 	if( this.props.input && this.state.open && !this.props.open ){
		// 		this.setState({ open: false });
		// 		this.props.onBlur( this.state.selectedDate || this.state.inputValue );
		// 	}
		// },

		localMoment: function( date, format ){
			var m = moment( date, format, this.props.strictParsing );
			if( this.props.locale )
				m.locale( this.props.locale );
			return m;
		},

		componentProps: {
			fromProps: ['value', 'isValidDate', 'renderDay', 'renderMonth', 'renderYear', 'useAMPM', 'prefix'],
			fromState: ['viewDate', 'selectedDate' ],
			fromThis: ['setDate', 'setTime', 'showView', 'addTime', 'subtractTime', 'updateSelectedDate', 'localMoment']
		},

		getComponentProps: function(){
			var me = this,
				formats = this.getFormats( this.props ),
				props = {dateFormat: formats.date, timeFormat: formats.time}
			;

			this.componentProps.fromProps.forEach( function( name ){
				props[ name ] = me.props[ name ];
			});
			this.componentProps.fromState.forEach( function( name ){
				props[ name ] = me.state[ name ];
			});
			this.componentProps.fromThis.forEach( function( name ){
				props[ name ] = me[ name ];
			});

			return props;
		},

		render: function() {
			var self = this;
			var Component = this.viewComponents[ this.state.currentView ],
				DOM = React.DOM,
				className = this.props.prefix + 'rdt ' + this.props.className,
				children = []
			;

			if( this.props.input ){
				children = [ 
					DOM.input( _.assign({
						key: 'i',
						type:'text',
						// className: 'form-control',
						onFocus: this.openCalendar,
						onChange: this.onInputChange,
						value: this.state.inputValue,
						ref: 'input'
					}, this.props.inputProps ))
					
				];
			}
			else {
				className += ' ' + this.props.prefix + 'rdtStatic';
			}

			if( this.state.open )
				className += ' ' + this.props.prefix + 'rdtOpen';

			return DOM.div({className: className, onMouseDown: this._mouseDownHandler, onMouseUp: this._mouseUpHandler}, children.concat(
				DOM.div(
					{ key: 'dt', className: this.props.prefix + 'rdtPicker' },
					React.createElement( Component, this.getComponentProps()),
					React.createElement("div", {className: this.props.prefix + 'rdtFooter' }, 
						// React.createElement(Button, {onClick: self.closeCalendar, text: 'Done', tag: 'button'})
						React.createElement("button", {onClick: self.closeCalendar, type: 'button', 'className': this.props.prefix + 'btn'}, "Done")
					)
				)
			));
		}
	});

	// Make moment accessible through the Datetime class
	Datetime.moment = moment;

	return Datetime;
});
