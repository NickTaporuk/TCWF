define([
    'react',
    'classnames'
], function(
    React,
    cn
) {

    return {

        render: function() {
            var rating = this.props.rating;

            var fullStars = parseInt(rating);
            var halfStars = rating - fullStars > 0 ? 1 : 0;
            var emptyStars = 5 - fullStars - halfStars;

            var stars = [];
            for (var i = 1; i <= 5; i++) {
                var star;
                if ( i <= fullStars ) {
                    star = '&#xE838;';
                } else if ( halfStars ) {
                    star = '&#xE839;';
                    halfStars = 0;
                } else {
                    star = '&#xE83A;';
                }
                stars.push(<i key={i} className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: star }} />);
            }

            return (
                <div className={cn('result_rating')}>
                    {stars}
                </div>
            );
        }

    }

});