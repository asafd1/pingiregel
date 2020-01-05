import React from 'react';
import { Input } from 'semantic-ui-react'
import { Label } from 'semantic-ui-react'
import { Icon } from 'semantic-ui-react'
import { Button } from 'semantic-ui-react'

class Editable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value ? props.value : "",
            isEditing: false,
            isDirty: false
        };

    }

    setEditing(isEditiing) {
        this.setState({isEditing: isEditiing});
    }

    handleValueSet(newValue) {
        if (newValue == this.state.value) {
            return;
        }

        const origValue = origValue ? origValue : this.state.value;
        
        this.setState({
            origValue: origValue,
            isDirty: true,
            value: newValue
        });
    }

    undo() {
        if (!this.state.origValue) {
            return;
        }

        this.setState({
            isDirty: false,
            value: this.state.origValue
        });
    }

    handleKeyDown(e) {
        if (e.keyCode == 27 /*ESC*/ || e.keyCode == 13 /*ENTER*/) {
            this.setEditing(false);
        }

        if (e.keyCode == 13 /*ENTER*/) {
            this.handleValueSet(e.nativeEvent.target.value);
        }
    }

    renderUndoButton() {
        return (<Button basic icon size='mini' onClick={() => this.undo()}>
                    <Icon name='undo'/>
                </Button>
        );
    }

    render() {
        const title = this.props.title + " :";
        const value = this.state.value;
        if (this.state.isEditing) {
            return (<div>
                        <Label basic>{title}</Label>
                        <Input
                        type="text"
                        autoFocus
                        defaultValue={value}
                        onBlur={() => this.setEditing(false)}
                        onKeyDown={e => this.handleKeyDown(e)}
                        />
                    </div>
            );
        } else {
            return (<div>
                        <Label basic>{title}</Label>
                        <Label 
                        onClick={() => this.setEditing(true)}
                        basic
                        >
                        {value}
                        </Label>
                        { this.state.isDirty ? this.renderUndoButton() : null }
                    </div>
            );
        }
    }
}

export default Editable;