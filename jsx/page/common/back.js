define([
    'react',
    'classnames',
    'lib/history'
], function(
    React,
    cn,
    history
) {

    return {
        render: function() {
            return <a href="javascript:;" onClick={this._handleClick} className={cn('back_link')}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C4;' }} />Back</a>
        },

        _handleClick: function(e) {
            e.preventDefault();
            history.back();
        }
    }

})