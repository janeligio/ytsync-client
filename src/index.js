import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

if(process.env.NODE_ENV === 'production') {
  process.env.REACT_APP_SERVER_API = 'https://ytsync-server.herokuapp.com';
  // console.log('Running in production', `Server API: ${process.env.REACT_APP_SERVER_API}`);
} else if(process.env.NODE_ENV === 'development') {
  // process.env.REACT_APP_SERVER_API = 'http://localhost:8080';
  console.log('Running in development', `Server API: ${process.env.REACT_APP_SERVER_API}`);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
