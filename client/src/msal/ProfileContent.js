import React, { useState, useEffect } from 'react'
import { loginRequest } from "./authConfig";
import { ProfileData } from "./components/ProfileData";
import { callMsGraph } from "./graph";
import { useMsal } from "@azure/msal-react";
import Button from 'react-bootstrap/Button';

export default function ProfileContent() {
    //on load of component we make call to azure to get profile data
     useEffect(() => {
         RequestProfileData()
     }, []);
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);
  
    const name = accounts[0] && accounts[0].name;
  
    function RequestProfileData() {
        
        const request = {
            ...loginRequest,
            account: accounts[0]
        };
  
        // Silently acquires an access token which is then attached to a request for Microsoft Graph data
        instance.acquireTokenSilent(request).then((response) => {
            callMsGraph(response.accessToken).then(response => setGraphData(response));
        }).catch((e) => {
            instance.acquireTokenPopup(request).then((response) => {
                callMsGraph(response.accessToken).then(response => setGraphData(response));
                console.log(response)
            });
        });
    }  
    return (
        graphData
    )
  };