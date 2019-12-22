import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import EditableListItems from './components/EditableListItems.jsx';

const BASE_URL = "http://localhost:8080/chats/-265465291";

// var items = [
//   'apple',
//   'computer',
//   'windows',
//   'mouse',
//   'keyboard',
//   'monitor',
//   'smartphone'
// ];

const playersEndpoint=`${BASE_URL}/players`;
ReactDOM.render(
    <EditableListItems itemsEndpoint={playersEndpoint}/>, 
    document.getElementById('root')
  );
