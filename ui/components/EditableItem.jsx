import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Editable from './Editable.jsx';

class EditableItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            item: props.item,
            dirty: new Array(Object.values(props.item).length).fill(false)
        };

    }

    save() {
        this.props.setDirty(false);
    }

    cancel() {
        this.props.setDirty(false);
    }

    renderButtons() {
        if (this.props.dirty == false) {
            return;
        }
        return (
            <Row style={{bottom: 0, position: "absolute"}}>
                <div>
                    <Button 
                        variant="outline-primary" 
                        onClick={this.save.bind(this)}>
                        Save
                    </Button>
                    {" "}
                    <Button 
                        variant="outline-secondary"
                        onClick={this.cancel.bind(this)}>
                        Cancel
                    </Button>
                </div>
            </Row>
        );
    }

    onClickUsername() {
        this.props.setDirty(true);
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
                        key={propertyName}>
                        <Editable title={propertyTitle} value={propertyValue}/>
                    </Row>);
                })}
            </Container>
        );
    }
}

export default EditableItem;