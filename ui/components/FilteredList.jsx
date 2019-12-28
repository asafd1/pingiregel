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
            allItems: this.props.items,
            filteredItems: this.props.items,
            selected: -1
        };
    }

    setItems(items) {
        this.setState({ allItems: items });
    }

    static getDerivedStateFromProps(nextProps, prevState){
        if (_.isEqual(nextProps.items, prevState.allItems)){
            return null;
        }
          
        return { 
            allItems : nextProps.items,
            filteredItems : nextProps.items
        };
    }
    
    handleSearchInput(e) {
        var searchText = e.target.value;
        
        var filteredItems = this.props.items.filter(function(item) {
            return item.search(searchText) > -1;
        });
        
        this.setState({ filteredItems: filteredItems });
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
        return (
            <div className="list filtered-list">
                <input className="filter form-control" onInput={this.handleSearchInput.bind(this)} type="text" placeholder="Search for..."/>
                <ListGroup 
                    onKeyDown={this.handleKeysDown.bind(this)}>
                    {this.state.filteredItems.map((item, i) => {
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