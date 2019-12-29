import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';

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
    }

    render() {
        const title = this.props.title+": ";
        if (this.state.isEditing) {
            return (<div>
                        <label>{title}</label>
                        <input
                        type="text"
                        value={this.props.value}
                        onBlur={() => this.setEditing(false)}
                        onKeyDown={e => this.handleKeyDown(e)}
                        />
                    </div>
            );
        } else {
            return (<div onClick={() => this.setEditing(true)}>
                        <label>{title}</label>
                        <label
                        >
                        {this.props.value}
                        </label>
                    </div>
            );
        }
    }
}

export default Editable;