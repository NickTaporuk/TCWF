 /**
  *  Mixin to add functionality for switching component visibility
  * 
  *  _handleToggleBtnMouseDown must be a handler for mouseDown of toggle button
  *
  *  _handleMouseUp must be a handler for mouseUp of root element of component
  *
  *  _handleMouseDown must be a handler for mouseDown of root element of component
  *
  * isShown state will be added to component
  *
  * @author mromanp
 */
define([], function () {

    return {
        componentDidMount: function() {
            window.addEventListener('mousedown', this._handleShow, false);
        },

        componentWillUnmount: function() {
            window.removeEventListener('mousedown', this._handleShow, false);
        },

        isMouseDownOnComp: false,
        isMouseDownOnToggleEl: false,

        _handleShow: function(event) {
            if (this.isMouseDownOnToggleEl) {
                this.setState({isShown: !this.state.isShown});
                return;
            }

            if (this.isMouseDownOnComp) {
                if (!this.state.isShown) {
                    this.setState({isShown: true});
                }
                return;
            }

            if (this.state.isShown) {
                this.setState({isShown: false});
            }
        },
        _handleMouseDown: function() {
            this.isMouseDownOnComp = true;
        },
        _handleMouseUp: function() {
            this.isMouseDownOnComp = false;
            this.isMouseDownOnToggleEl = false;
        },
        _handleToggleBtnMouseDown: function(event) {
            event.preventDefault();
            this.isMouseDownOnToggleEl = true;
        }
    }

});