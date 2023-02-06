import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// import GuestForm from './GuestForm';
import GuestFormNew from './GuestFormNew';

import GuestForm from './GuestForm';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App/> */}
    {/* <AccountMadeScreen /> */}
    <GuestForm />
    {/* <GuestFormNew/> */}
  </React.StrictMode>
);