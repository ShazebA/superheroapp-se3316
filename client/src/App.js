import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';

class App extends Component {
  state = {
      data: null
    };
    render() {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">{this.state.data}</p>
        </div>
      );
    }
  }
  
  export default App; 