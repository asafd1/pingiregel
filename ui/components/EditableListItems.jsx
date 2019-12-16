import React from 'react';
import FilteredList from './FilteredList.jsx';
import EditableUser from './EditableUser.jsx';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class EditableListItems extends React.Component {
    constructor(props) {    
        super(props);
        this.state = {
            items: this.props.items,
            selected: -1,
            dirty: false
        };
    }

    handleItemSelected(i) {
        this.setState({ 
            selected : i,
            dirty : false
        });
        console.log(`${this.props.items[i]} was selected`);
    }

    handleItemDeselected(i) {
        this.setState({ 
            selected : -1,
            dirty : false
        });
        console.log(`${this.props.items[i]} was unselected`);
    }

    setDirty(dirty) {
        this.setState({ 
            dirty : dirty
        });
    }

    renderUser() {
        const user = {
            username: this.state.items[this.state.selected],
            firstname: "fn " + this.state.items[this.state.selected],
            lastname: "ln " + this.state.items[this.state.selected]
        }
        if (this.state.selected >= 0) {
            return (
                <Col md="6" style={{ marginTop: '59px', backgroundColor: 'snow', height: '309px' }}>
                    <EditableUser 
                        user={user} 
                        dirty={this.state.dirty} 
                        setDirty={this.setDirty.bind(this)}></EditableUser>
                </Col>
            )
        }
    }
    
    render() {
        return (
            <Container>
                <Row>
                    <Col id="heading">heading</Col>
                </Row>
                <Row>
                    <Col md="6">
                        <FilteredList 
                            items={this.state.items} 
                            handleItemSelected={(i) => this.handleItemSelected(i)}
                            handleItemDeselected={(i) => this.handleItemDeselected(i)}
                        />
                    </Col>
                    {this.renderUser()}
                </Row>
            </Container>
        );
    }
}

export default EditableListItems;