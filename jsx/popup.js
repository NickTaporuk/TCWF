define([
    'react',
    'load!stores/popupStore',
    'classnames'
], function(
    React,
    popupStore,
    cn
) {

    return {
        displayName: 'popup',

        getInitialState: function() {
            return {
                name: 'alert',
                title: '',
                content: '',
                is_hidden: true
            };
        },

        componentDidMount: function() {
            popupStore.bind('change', this._changeState);
        },

        componentWillUnmount: function() {
            popupStore.unbind('change', this._changeState);
        },

        render: function() {
            var content = this.state.content;

            if (this.state.content) {
                if (this.state.content && typeof this.state.content == 'string') {
                    content = <p dangerouslySetInnerHTML={ {__html: content} } />;
                }
                content = <div className={cn('modal_content_inner')}>{content}</div>
            }

            return (
                <div id={cn(this.state.name + '_modal')} className={cn('modal')} aria-hidden={this.state.is_hidden} role="dialog">
                    <div className={cn('row')}>
                        <div id={cn('modal_content')} className={cn('modal_content')}>
                            <div className={cn('modal_content_top')}>
                                <h4 dangerouslySetInnerHTML={ {__html: this.state.title} } />
                                <button onClick={this._handleCloseClick} className={cn(['brand_btn_light', 'btn_small', 'modal_close'])} title="Close this modal" aria-label="Close this modal"><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE5C9;' }} /> Close</button>
                            </div>
                            {content}
                        </div>
                    </div>
                </div>
            );
        },

        _changeState: function() {
            this.setState({
                name: popupStore.getName(),
                title: popupStore.getTitle(),
                content: popupStore.getContent(),
                is_hidden: popupStore.isHidden()
            });
        },

        _handleCloseClick: function() {
            this.setState({
                is_hidden: true
            });
        }
    };

});