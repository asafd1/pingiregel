import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import EditableListItems from './components/EditableListItems.jsx';

// var items = [
//   'apple',
//   'computer',
//   'windows',
//   'mouse',
//   'keyboard',
//   'monitor',
//   'smartphone'
// ];

var DB = require("../src/db");
DB.connect().then((db) => start(db)).catch((error) => errorHandler(error));

function start(db) {
  db.getPlayers().then((players) => {
    items = _.map(players, (player) => {
        return player.firstname;
    })
  });
  ReactDOM.render(
      <EditableListItems items={items}/>, 
      document.getElementById('root')
    );
}
