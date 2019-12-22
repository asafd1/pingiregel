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
            items: [],
            selected: -1,
            dirty: false
        };
    }

    async getItems() {
        const response =
            await fetch(this.props.itemsEndpoint
                //   ,{ headers: {'Content-Type': 'application/json'}}
            )
        console.log(response.body);
        return await response.json();
    }

    componentDidMount() {
        this.getItems().then((response) => 
            this.setState({items : response.map((item) => {return item.firstname;})}));
    }

    handleItemSelected(i) {
        this.setState({ 
            selected : i,
            dirty : false
        });
    }

    handleItemDeselected(i) {
        this.setState({ 
            selected : -1,
            dirty : false
        });
    }

    setDirty(dirty) {
        this.setState({ 
            dirty : dirty
        });
    }

    renderUser() {
        if (this.state.selected >= 0) {
            const user = {
                username: this.state.items[this.state.selected],
                firstname: "fn " + this.state.items[this.state.selected],
                lastname: "ln " + this.state.items[this.state.selected]
            }
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