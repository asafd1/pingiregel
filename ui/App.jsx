import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import FilteredList from './components/FilteredList.jsx';

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
  <FilteredList items={items}/>, 
  document.getElementById('root')
);

