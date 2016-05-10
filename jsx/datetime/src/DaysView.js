define(['react', 'moment'], function(React, moment) {
	var DOM = React.DOM;
	var DateTimePickerDays = React.createClass({

		render: function() {
			var footer = this.props.useAMPM ? this.renderFooterAMPM() : this.renderFooter(),
				date = this.props.viewDate,
				locale = date.localeData(),
				tableChildren
			;

			tableChildren = [
				DOM.thead({ key: 'th'}, [
					DOM.tr({ key: 'h'},[
						DOM.th({ key: 'p', className: this.props.prefix + 'rdtPrev' }, DOM.button({onClick: this.props.subtractTime(1, 'months'), type: 'button', 'tabIndex': -1, dangerouslySetInnerHTML:  {__html: '&#x276c;'} })),
						//DOM.th({ key: 's', className: 'rdtSwitch', onClick: this.props.showView('months'), colSpan: 5, 'data-value': this.props.viewDate.month() }, locale.months( date ) + ' ' + date.year() ),
						DOM.th({ key: 's', colSpan: 5}, locale.months( date ) + ' ' + date.year() ),						
						DOM.th({ key: 'n', className: this.props.prefix + 'rdtNext' }, DOM.button({onClick: this.props.addTime(1, 'months'), type: 'button', 'tabIndex': -1, dangerouslySetInnerHTML:  {__html: '&#x276d;'} }))
					]),
					DOM.tr({ key: 'd'}, this.getDaysOfWeek( locale ).map( function( day, index ){ return DOM.th({ key: day + index, className: 'dow'}, day ); }) )
				]),
				DOM.tbody({key: 'tb'}, this.renderDays())
			];

			if( footer )
				tableChildren.push( footer );

			return DOM.div({ className: this.props.prefix + 'rdtDays' },
				DOM.table({}, tableChildren )
			);
		},

		/**
		 * Get a list of the days of the week
		 * depending on the current locale
		 * @return {array} A list with the shortname of the days
		 */
		getDaysOfWeek: function( locale ){
			var days = locale._weekdaysMin,
				first = locale.firstDayOfWeek(),
				dow = [],
				i = 0
			;

			days.forEach( function( day ){
				dow[ (7 + (i++) - first) % 7 ] = day;
			});

			return dow;
		},

		renderDays: function() {
			var date = this.props.viewDate,
				selected = this.props.selectedDate && this.props.selectedDate.clone(),
				prevMonth = date.clone().subtract( 1, 'months' ),
				currentYear = date.year(),
				currentMonth = date.month(),
				weeks = [],
				days = [],
				renderer = this.props.renderDay || this.renderDay,
				isValid = this.props.isValidDate || this.isValidDate,
				classes, disabled, dayProps, currentDate
			;

			// Go to the last week of the previous month
			prevMonth.date( prevMonth.daysInMonth() ).startOf('week');
			var lastDay = prevMonth.clone().add(42, 'd');

			while( prevMonth.isBefore( lastDay ) ){
				classes = this.props.prefix +  'rdtDay';
				currentDate = prevMonth.clone();

				if( prevMonth.year() < currentYear || prevMonth.month() < currentMonth )
					classes += ' ' + this.props.prefix + 'rdtOld';
				else if( prevMonth.year() > currentYear || prevMonth.month() > currentMonth )
					classes += ' ' + this.props.prefix + 'rdtNew';

				if( selected && prevMonth.isSame( {y: selected.year(), M: selected.month(), d: selected.date()} ) )
					classes += ' ' + this.props.prefix + 'rdtActive';

				if (prevMonth.isSame(moment(), 'day') )
					classes += ' ' + this.props.prefix + 'rdtToday';

				disabled = !isValid( currentDate, selected );
				if( disabled )
					classes += ' ' + this.props.prefix + 'rdtDisabled';

				dayProps = {
					key: prevMonth.format('M_D'),
					'data-value': prevMonth.date(),
					className: classes
				};
				if( !disabled )
					dayProps.onClick = this.props.updateSelectedDate;

				days.push( renderer( dayProps, currentDate, selected ) );

				if( days.length == 7 ){
					weeks.push( DOM.tr( {key: prevMonth.format('M_D')}, days ) );
					days = [];
				}

				prevMonth.add( 1, 'd' );
			}

			return weeks;
		},

		renderDay: function( props, currentDate, selectedDate ){
			return DOM.td( props, currentDate.date() );
		},

		renderFooterAMPM: function() {
			if( !this.props.timeFormat )
				return '';

			var date = this.props.selectedDate || this.props.viewDate;	
			var curHour = date.format('h');
			var curMin = date.format('m');
			var curAMPM = date.format('a');
			if (curMin < 45 && curMin > 15) {
				curMin = 30;
			}

			var hours = [];
			for (var h = 1; h <= 12; h++) {
				hours.push(DOM.option({value: h, key: h}, h));
			}

			var changeTime = function(type, event) {
				this.props.setTime(type, event.target.value);
			};

			return DOM.tfoot({ key: 'tf'},
				DOM.tr({},
					DOM.td({ colSpan: 7, className: this.props.prefix + 'rdtTime' }, [
						DOM.div({key: 'l'}, 'Please select preferred time:'),
						DOM.select({value: curHour, key: 'h', onChange: changeTime.bind(this, 'hours') }, hours),
						DOM.select({value: curMin, key: 'm', onChange: changeTime.bind(this, 'minutes')}, [DOM.option({value: 0, key: 0}, '00'), DOM.option({value: 30, key: 30}, '30')]),
						DOM.select({value: curAMPM, key: 'ap', onChange: changeTime.bind(this, 'meridiem')}, [DOM.option({value: 'am', key: 'am'}, 'AM'), DOM.option({value: 'pm', key: 'pm'}, 'PM')])
					])
				)
			);	
		},

		renderFooter: function(){
			if( !this.props.timeFormat )
				return '';

			var date = this.props.selectedDate || this.props.viewDate;
			return DOM.tfoot({ key: 'tf'},
				DOM.tr({},
					DOM.td({ onClick: this.props.showView('time'), colSpan: 7, className: this.props.prefix + 'rdtTimeToggle'}, date.format( this.props.timeFormat ))
				)
			);
		},
		isValidDate: function(){ return 1; }
	});

	return DateTimePickerDays;
});
