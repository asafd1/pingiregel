import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup'

// class ListItem extends ListGroup.Item {
//     constructor(props) {
//         this.action = true;
//         this.active = true;
//         super(props);
//     }

//     render() {
//         return(
//             <li className="list-group-item" onClick={() => this.props.onClick()}>{this.props.children}</li>
//         );
//     }
// }

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
            this.handleItemDeselected(i);
        } else {
            if (this.state.selected >= 0) {
                this.handleItemDeselected(this.state.selected);
            }
            this.setState({ selected: i });
            this.handleItemSelected(i);
        }
    }

    handleItemSelected(i) {
        console.log(`${this.props.items[i]} was selected`);
    }

    handleItemDeselected(i) {
        console.log(`${this.props.items[i]} was unselected`);
    }

    render() {
        return (
            <div className="list filtered-list">
                <input className="filter form-control" onInput={this.handleSearchInput.bind(this)} type="text" placeholder="Search for..."/>
                <ul className="list-group">
                    {this.state.items.map((item, i) => {
                        return(<ListGroup.Item 
                            action
                            active={this.state.selected == i}
                            onClick={() => this.handleClickItem(i)}>
                            {item}
                            </ListGroup.Item>);
                    })}
                </ul>
            </div>
        );
    }
}

export default FilteredList;