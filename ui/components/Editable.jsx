import React from 'react';

class Editable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: props.title,
            value: props.value,
            isEditing: false,
            isDirty: false
        };

    }

    setEditing(b) {
        this.setState({isEditing: b});
    }

    handleKeyDown(e) {
        if (e.keyCode == 27 /*ESC*/ || e.keyCode == 13 /*ENTER*/) {
            this.setEditing(false);
        }
    }

    render() {
        const title = this.props.title+": ";
        if (this.state.isEditing) {
            return (<div>
                        <label>{title}</label>
                        <input
                        type="text"
                        autoFocus
                        value={this.props.value}
                        onBlur={() => this.setEditing(false)}
                        onKeyDown={e => this.handleKeyDown(e)}
                        />
                    </div>
            );
        } else {
            return (<div>
                        <label>{title}</label>
                        <label onClick={() => this.setEditing(true)}>
                        {this.props.value}
                        </label>
                    </div>
            );
        }
    }
}

export default Editable;