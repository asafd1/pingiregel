import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';

class EditableItem extends React.Component {
    constructor(props) {
        super(props);
    }

    save() {
        console.log("SAVE");
        this.props.setDirty(false);
    }

    cancel() {
        console.log("CANCEL");
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
        return (

            <Form>
                <FormGroup as={Row} controlId="formPlaintextUsername" onClick={this.onClickUsername.bind(this)}>
                    <div>
                        <FormLabel column sm="20">
                        Username:
                        </FormLabel>
                        {' '}
                        <FormLabel column sm="20">{this.props.user.username}</FormLabel>
                    </div>
                </FormGroup>

                <FormGroup as={Row} controlId="formPlaintextUsername">
                    <div>
                        <FormLabel column sm="20">
                        First name:
                        </FormLabel>
                        {' '}
                        <FormLabel column sm="20">{this.props.user.firstname}</FormLabel>
                    </div>
                </FormGroup>

                <FormGroup as={Row} controlId="formPlaintextUsername">
                    <div>
                        <FormLabel column sm="20">
                        Last name:
                        </FormLabel>
                        {' '}
                        <FormLabel column sm="20">{this.props.user.lastname}</FormLabel>
                    </div>
                </FormGroup>
                {
                this.renderButtons()
                }
            </Form>

            // <Container>
                
            //     <Row><Col id="username"  onClick={this.onClickUsername.bind(this)}>username:  {this.props.user.username}</Col></Row>
            //     <Row><Col id="firstname" onClick={this.onClickUsername.bind(this)}>firstname: {this.props.user.firstname}</Col></Row>
            //     <Row><Col id="lastname"  onClick={this.onClickUsername.bind(this)}>lastname:  {this.props.user.lastname}</Col></Row>
            // </Container>
        );
    }
}

export default EditableItem;