import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import EditableListItems from './components/EditableListItems.jsx';

const CHAT_ID = 1111;

const BASE_URL = `http://localhost:8080/chats/${CHAT_ID}`;

// var items = [
//   'apple',
//   'computer',
//   'windows',
//   'mouse',
//   'keyboard',
//   'monitor',
//   'smartphone'
// ];

const usersConfig = {
  playersEndpoint: `${BASE_URL}/players`,
  editableProperties : {
    'username' : 'Username',
    'firstname' : 'First Name',
    'lastname' : 'Last Name'
  }
}

ReactDOM.render(
    <EditableListItems 
      itemsEndpoint={usersConfig.playersEndpoint}
      editableProperties={usersConfig.editableProperties}/>,
    document.getElementById('root')
  );
