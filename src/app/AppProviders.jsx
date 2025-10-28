import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { store } from '../store/store';
import App from './App';

import 'react-toastify/dist/ReactToastify.css';
import '../styles/index.css';

const AppProviders = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
    </Provider>
  );
};

export default AppProviders;
