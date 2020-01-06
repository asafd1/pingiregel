import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup'
var _ = require("underscore");

const KEY_ESC = 27;
const KEY_UP = 38;
const KEY_DOWN = 40;

class FilteredList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            searchText: "",
            selected: -1
        };
    }
   
    handleSearchInput(e) {        
        this.setState({ searchText : e.target.value });
    }

    handleKeysDown(e) {
        const currentSelected = this.state.selected;
        if (e.keyCode == KEY_DOWN && currentSelected < this.state.filteredItems.length - 1) {
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

    handleClickItem(i) {
        if (this.state.selected == i) {
            this.setState({ selected: -1 });
            this.props.handleItemDeselected(i);
        } else {
            if (this.state.selected >= 0) {
                this.props.handleItemDeselected(this.state.selected);
            }
            this.setState({ selected: i });
            this.props.handleItemSelected(i);
        }
    }

    render() {
        const searchText = this.state.searchText;

        return (
            <div className="list filtered-list">
                <input className="filter form-control" onInput={this.handleSearchInput.bind(this)} type="text" placeholder="Search for..."/>
                <ListGroup 
                    onKeyDown={this.handleKeysDown.bind(this)}>
                    {this.props.items.map((item, i) => {
                        if (item.search(searchText) < 0 && i != this.state.selected) {
                            return;
                        }
                        return(<ListGroup.Item 
                            key={i}
                            action
                            active={this.state.selected == i}
                            onClick={() => this.handleClickItem(i)}>
                            {item}
                            </ListGroup.Item>);
                    })}
                </ListGroup>
            </div>
        );
    }
}

export default FilteredList;