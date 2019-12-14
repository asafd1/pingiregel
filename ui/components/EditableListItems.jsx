import React from 'react';
import FilteredList from './FilteredList.jsx';
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
        this.setState({ selected : i });
        console.log(`${this.props.items[i]} was selected`);
    }

    handleItemDeselected(i) {
        console.log(`${this.props.items[i]} was unselected`);
    }

    render() {
        return (
            <Container>
            <Row>
                <Col id="heading">heading</Col>
            </Row>
            <Row>
                <Col>
                    <FilteredList 
                        items={this.state.items} 
                        handleItemSelected={(i) => this.handleItemSelected(i)}
                        handleItemDeselected={(i) => this.handleItemDeselected(i)}
                    />
                </Col>
                <Col>
                    <Row style={{ marginTop: '59px', backgroundColor: 'lightgray', height: '100px' }}>{this.state.items[this.state.selected]}</Row>
                </Col>
            </Row>
            <Row>
                <Col>buttons</Col>
            </Row>
            </Container>
        );
    }
}

export default EditableListItems;