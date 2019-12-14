import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup'

class FilteredList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            items: this.props.items,
            selected: -1
        };
    }

    handleSearchInput(e) {
        var searchText = e.target.value;
        
        var filteredItems = this.props.items.filter(function(item) {
            return item.search(searchText) > -1;
        });
        
        this.setState({ items: filteredItems });
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
                <ListGroup>
                    {this.state.items.map((item, i) => {
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