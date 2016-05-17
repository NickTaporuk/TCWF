define(['react', 'classnames'], function (React, cn) {

    return {
        getDefaultProps: function () {
            return {
                onSelect: function () {}
            };
        },

        render: function () {
            var locationEls = [];

            var locations = this.props.locations;
            var selectedLocId = this.props.location_id;

            Object.keys(locations).forEach(function (locationId, i) {
                var location = locations[locationId];
                locationEls.push(React.createElement(
                    'li',
                    { key: i },
                    React.createElement(
                        'h5',
                        null,
                        location.name
                    ),
                    React.createElement(
                        'div',
                        { className: cn('location_address') },
                        location.address_line_1 + ' ' + location.address_line_2
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'span',
                            { className: cn('location_city') },
                            location.city
                        ),
                        ', ',
                        React.createElement(
                            'span',
                            { className: cn('location_region') },
                            location.province
                        ),
                        ', ',
                        React.createElement(
                            'span',
                            { className: cn('location_postal') },
                            location.postal_code
                        )
                    ),
                    React.createElement(
                        'a',
                        { href: 'http://maps.google.com/?q=' + location.latitude + ',' + location.longitude + '&z=13', target: '_blank' },
                        'Directions'
                    ),
                    React.createElement(
                        'button',
                        { onClick: this._handleSelectClick.bind(this, location.id), disabled: selectedLocId && location.id === selectedLocId, className: cn(['brand_btn', 'btn_small', 'location_btn']) },
                        selectedLocId && location.id === selectedLocId ? 'Selected location' : 'Select this location'
                    )
                ));
            }, this);

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'ul',
                    { id: cn('locations'), className: cn('locations') },
                    locationEls
                )
            );
        },

        _handleSelectClick: function (id, event) {
            event.preventDefault();
            this.props.onSelect(id);
        }
    };
});