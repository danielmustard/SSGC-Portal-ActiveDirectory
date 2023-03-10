import React from 'react'
import ReactDOM from 'react-dom/client'

import '/src/css/index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

//msal imports*
import { PublicClientApplication } from '@azure/msal-browser'
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "src/msal/authConfig";
const msalInstance = new PublicClientApplication(msalConfig);

//guest form import*
import Guestform from 'src/pages/Guestform';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <Guestform/>
    </MsalProvider>
  </React.StrictMode>,
)