(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

/**
 * Tyherox
 *
 * TimeWidget
 *
 * The TimeWidget is a simple widget used to tell time. Expanding adds the functionality of showing seconds
 */

class Time extends React.Component {

    constructor(props) {
        super(props);
        this.state = { time: 0 };
    }

    tick() {
        var time = "ERROR";
        var date = new Date();
        var hours = date.getHours();
        if (hours < 10) hours = "0" + hours;
        var minutes = date.getMinutes();
        if (minutes < 10) minutes = "0" + minutes;

        //Different time telling depending on widget size
        if (this.props.refWidth == 1) time = hours + ":" + minutes;else {
            var seconds = date.getSeconds();
            if (seconds < 10) seconds = "0" + seconds;
            time = hours + ":" + minutes + ":" + seconds;
        }
        this.setState({ time: time });
    }

    componentDidMount() {
        var self = this;
        self.tick();
        //Set time keeping frequency
        setInterval(function () {
            self.tick();
        }, 500);
    }
    render() {
        return React.createElement(
            "div",
            { id: "time", ref: "time" },
            this.state.time
        );
    }
}

var main = {
    id: 2,
    refWidth: 1,
    refHeight: 1,
    refLeft: 7,
    refTop: 0,
    minWidth: 1,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 2,
    content: Time
};

module.exports = main;
}());
//# sourceMappingURL=main.js.map