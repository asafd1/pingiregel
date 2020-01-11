import React from 'react';
import FilteredList from './FilteredList.jsx';
import EditableItem from './EditableItem.jsx';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class EditableListItems extends React.Component {
    constructor(props) {    
        super(props);
        this.state = {
            items: [],
            selected: -1
        };
    }

    async getItems() {
        const response = 
            await fetch(this.props.itemsEndpoint, {
                headers: {'Content-Type': 'application/json'}
        });
        const json = await response.json();
        console.log(json);
        return json;
    }

    async updateItem(item) {
        const url = this.props.itemsEndpoint + "/" + this.props.id(item);
        const response = 
            await fetch(url, {
                method: 'PUT',
                cache: 'no-cache',
                headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(item)
          });
          this.componentDidMount()
          return await response.json();
    }

    async deleteItem(id) {
        const url = this.props.itemsEndpoint + "/" + id;
        const response = 
            await fetch(url, {
                method: 'DELETE',
                cache: 'no-cache',
                headers: {'Content-Type': 'application/json'}
          });
          this.componentDidMount()
          return await response.json();
    }
    
    componentDidMount() {
        this.getItems().then((response) => 
            this.setState({items : response})
        );
    }

    handleItemSelected(index) {
        this.setState({ 
            selected : index
        });
    }

    handleItemDeselected() {
        this.setState({ 
            selected : -1
        });
    }

    handleItemDeleted(id) {
        this.handleItemDeselected();
        this.deleteItem(id); 
    }

    renderItem() {
        if (this.state.selected < 0) {
            return;
        }

        const item = this.state.items[this.state.selected];
        return (
            <Col md="6" style={{marginTop: '59px', backgroundColor: 'white', height: '309px' }}>
                <EditableItem 
                    key={this.props.id(item)}
                    editableProperties={this.props.editableProperties}
                    item={item} 
                    updateItem={(item) => this.updateItem(item)}
                    >
                    </EditableItem>
            </Col>
        )
    }
    
    render() {
        return (
            <Container>
                <Row>
                    <Col md="6">
                        <FilteredList 
                            items={this.state.items} 
                            handleItemSelected={(index) => this.handleItemSelected(index)}
                            handleItemDeselected={() => this.handleItemDeselected()}
                            handleItemDeleted={(id) => this.handleItemDeleted(id)}
                            id={(item) => this.props.id(item)}
                            title={(item) => this.props.title(item)}
                        />
                    </Col>
                    {this.renderItem()}
                </Row>
            </Container>
        );
    }
}

export default EditableListItems;