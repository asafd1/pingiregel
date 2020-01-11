import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup'
import { Button } from 'semantic-ui-react'
var _ = require("underscore");

const KEY_ESC = 27;
const KEY_UP = 38;
const KEY_DOWN = 40;

let deleteTimeout = {};

class FilteredList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            searchText: "",
            filteredItemsCount: props.items.length,
            selected: -1,
            deleted: []
        };
    }
   
    componentDidMount() {
        document.addEventListener("keydown", this.handleKeysDown.bind(this));
    }
  
    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeysDown.bind(this));
    }

    handleSearchInput(e) {        
        this.setState({ searchText : e.target.value });
    }

    handleKeysDown(e) {
        const currentSelected = this.state.selected;
        if (e.keyCode == KEY_DOWN && currentSelected < this.state.filteredItemsCount - 1) {
            const newSelected = currentSelected + 1;
            this.props.handleItemDeselected(currentSelected);
            this.props.handleItemSelected(newSelected);
            this.setState({ selected: newSelected });
        }
        if (e.keyCode == KEY_UP && currentSelected > 0) {
            const newSelected = currentSelected - 1;
            this.props.handleItemDeselected(currentSelected);
            this.props.handleItemSelected(newSelected);
            this.setState({ selected: newSelected });
        }
        if (e.keyCode == KEY_ESC && this.state.selected != -1) {
            this.props.handleItemDeselected(currentSelected);
            this.setState({ selected: - 1  });
        }
    }

    handleClickItem(index) {
        if (this.state.selected == index) {
            this.setState({ selected: -1 });
            this.props.handleItemDeselected();
        } else {
            if (this.state.selected >= 0) {
                this.props.handleItemDeselected(this.state.selected);
            }
            this.setState({ selected: index });
            this.props.handleItemSelected(index);
        }
    }

    delayDelete(id) {
        deleteTimeout[id] = setTimeout(() => {
            this.props.handleItemDeleted(id);
            this.setState({deleted: this.state.deleted.filter((v) => v != id)});
        }, 3000)
    }

    undoDelete(id) {
        clearTimeout(deleteTimeout[id]);
    }

    handleButtonClick(e, buttonType, id) {
        e.stopPropagation();

        let deleted = this.state.deleted;

        if (buttonType == 'trash') {
            if (deleted.includes(id)) {
                return;
            }
            deleted.push(id);
            this.delayDelete(id);
        } else {
            // undo
            deleted = deleted.filter((v) => v != id);
            this.undoDelete(id);
        }

        this.setState({deleted: deleted});
    }

    render() {
        const searchText = this.state.searchText;
        this.state.filteredItemsCount = 0;

        return (
            <div className="list filtered-list">
                <input className="filter form-control" onInput={this.handleSearchInput.bind(this)} type="text" placeholder="Search for..."/>
                <ListGroup>
                    {this.props.items.map((item, index) => {
                        const title = this.props.title(item);
                        if (title.search(searchText) < 0 && index != this.state.selected) {
                            return;
                        }
                        this.state.filteredItemsCount++;

                        let buttonType = 'trash';
                        let className = "";
                        let id = this.props.id(item);
                        let active = this.state.selected == index;
                        if (this.state.deleted.includes(id)) {
                            buttonType = 'undo';
                            className = "warning";
                            active = false;
                        }

                        // Using div inside ListGroup.Item to avoid button inside button
                        // ListGroup.Item renders as a button when it has onClick property
                        return(<ListGroup.Item className={className}
                            key={id}
                            active={active}>
                            <div 
                                onClick={() => this.handleClickItem(index)}>
                                {title}
                                <Button size='mini' floated='right' icon={buttonType} name={buttonType} basic onClick={(e) => this.handleButtonClick(e, buttonType, id)}/>
                            </div>
                        </ListGroup.Item>);
                    })}
                </ListGroup>
            </div>
        );
    }
}

export default FilteredList;