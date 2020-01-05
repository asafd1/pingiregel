import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Editable from './Editable.jsx';

class EditableItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            item: props.item,
            dirty: new Array(Object.values(props.item).length).fill(false)
        };

    }

    update(name, value) {
        const item = this.state.item;
        item[name] = value;
        this.setState({
            item: item
        });
        this.props.updateItem(item);
    }

    render() {
        const labels = Object.entries(this.props.editableProperties);
        return (
            <Container>
                {labels.map((entry, i) => {
                    const propertyName = entry[0];
                    const propertyTitle = entry[1];
                    const propertyValue = this.props.item[propertyName];
                    return(<Row
                        key={propertyName}
                        style={{margin: '10px'}}>
                        <Editable 
                            title={propertyTitle}
                            value={propertyValue}
                            valueChanged={(newValue) => this.update(propertyName, newValue)}
                        />
                    </Row>);
                })}
            </Container>
        );
    }
}

export default EditableItem;