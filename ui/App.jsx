import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import EditableListItems from './components/EditableListItems.jsx';

var items = [
  'apple',
  'computer',
  'windows',
  'mouse',
  'keyboard',
  'monitor',
  'smartphone'
];

ReactDOM.render(
    <EditableListItems items={items}/>, 
    document.getElementById('root')
  );
