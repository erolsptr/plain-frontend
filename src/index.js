// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client'; // Create-react-app V5+ için bu şekilde
import './index.css'; // Genel CSS dosyası
import App from './App'; // Ana App component'imiz
import reportWebVitals from './reportWebVitals';

// Router'ı kullanabilmek için BrowserRouter'u index.js'e ekliyoruz.
import { BrowserRouter } from 'react-router-dom';

// React v18 için createRoot kullanılıyor.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* BrowserRouter, tüm uygulamamızı sarmalayacak. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();