import React, { useState } from 'react'

//axios for calling API
import axios from 'axios'

//Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { LoadSpinner } from 'src/components/LoadSpinner'


//CSS imports

import 'src/css/guestForm.css'

import AccountMadeScreen from 'src/pages/AccountMadeScreen';
import { PageLayout } from "src/components/PageLayout";

import { useIsAuthenticated } from "@azure/msal-react";
import { UnauthenticatedTemplate, AuthenticatedTemplate } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";

import { loginRequest } from "src/msal/authConfig";


export default function Guestform(){
  
  const isAuthenticated = useIsAuthenticated();

  //state for storing our form data


  const [formData, setFormData] = useState({
    guestFirstName: '',
    guestSurname: '',
    guestPurpose:'',
    guestLocation:'',
    guestTimeActive:'',
  })

  const { instance, accounts } = useMsal();
  //on click of form submit button we also want to get our JWT and send it to our backend to validate that user sending data is authorised to.

  
  const requestProfileData = async () => {
    const request = {
      ...loginRequest,
      account: accounts[0]
    };
    let token = {};
    try {
      // Silently acquires an access token which is then attached to a request for Microsoft Graph data
      const response = await instance.acquireTokenSilent(request);
      token = response;
    } catch (error) {
      console.log(error);
    }
    return Promise.resolve(token);
  }
 

  //state for storing any errors that we want to present to frontend
  const [error, setError] = useState("");

  const [apiReturn, setAPIReturn] = useState("");
  const [isLoading, setIsLoading] = useState();

  

  //stores our form data inside the USE STATE
  const handleChange = (event) =>{
    setFormData({...formData, [event.target.name]: event.target.value})
  }
  
  const handleSubmit = async (e) =>{
    e.preventDefault();
    setIsLoading(true);
    const token = await requestProfileData();
      if (validateInput(formData)){
        setError(validateInput(formData))
        setIsLoading(false)
      }else{ //we only want to post data if graphdata is not blank]
        postData(formData,token)
      }
      //validate incoming data, check if any values are empty
  }

  //after our form data input has been validated we then post the data to our endpoint
  const postData = async(data,token) =>{
    const json = {
      guest : data,
      azureToken : token.idToken //we only send JWT portion to backend
    }
  
    let postUrl;
    //`${import.meta.env.BASE_URL}formData`
    import.meta.env.MODE == "dev" ? postUrl = "http://localhost:5001/formData" : postUrl = import.meta.env.BASE_URL
    axios.post(postUrl, json)
      .then(response =>{
          if(response.data.status !== 201){ //if response status is not 201 there must be an error of some kind
            setError(`Error: ${response.data.lde_message}`)
            setIsLoading(false)
          }else{
            setAPIReturn(response.data)
            setIsLoading(false)
            
          }
          
      })
      .catch(error =>{
        error.toString() === "AxiosError: Network Error" ? setError("Unable to connect to LDAP server") : setError(error.toString());
        setIsLoading(false) // If we get error string back dont infinite loop loading 
      })
  } 

  const validateInput = (data) =>{
    for(var key in data) {
      if(data[key] === "") {
         return("Please fill all form fields!")
      }
  
  }}
    if (apiReturn === "" && isAuthenticated === true){      
      return(  
          <Form className="MainForm" autoComplete='off' autoCapitalize='off' autoCorrect='off' onSubmit={handleSubmit}>
            
          <h1 class="display-5">Self Service Guest Portal</h1> 
              <Alert key="warning" variant="warning">
                By completing this form you and your guest both agree to the IT Acceptable use policy (Link Here)
              </Alert>
              
              <div className="FormElements">
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Guest First Name:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Guest First Name"
                    name="guestFirstName"
                    value={formData.guestFirstName}
                    onChange={handleChange}
                  />
                </Form.Group>
    
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Guest Surname:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter Guest Name"
                    name="guestSurname"
                    value={formData.guestSurname}
                    onChange={handleChange}                
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Purpose of Access:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Purpose of access"
                    name="guestPurpose"
                    value={formData.guestPurpose}
                    onChange={handleChange} 
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Guest Location:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Guest Location"
                    name="guestLocation"
                    value={formData.guestLocation}
                    onChange={handleChange} 
                  />
                  <Form.Text className="text-muted">
                    For reference, your guest is not limited to using their account in this location.
                  </Form.Text>
                </Form.Group>
                {/* Amount of time that guest needs access for, will need to be converted into unix time*/}
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="timeSelect">Account Duration</Form.Label>
                  <Form.Select
                    id="disabledSelect"
                    name="guestTimeActive"
                    value={formData.guestTimeActive}
                    onChange={handleChange}
                    placeholder='Duration'>
                    <option key = 'blankChoice' hidden value> --Select Duration-- </option>
                    <option value={1}>1 Day</option>
                    <option value={2}>2 Days</option>
                    <optgroup label="Guest will expire exactly 24 or 48 hours after submission"></optgroup>
                  </Form.Select>
               </Form.Group>
               
             <Button variant="primary" type="submit" disabled={isLoading}>
               Submit
               {
              isLoading === true &&
              <div style={{display:'flex',justifyContent:'center'}}>
                <LoadSpinner/>
              </div>
             }
             </Button> 
             <hr></hr>
             {error !== "" &&
              <Alert key="danger" variant='danger'>{error}</Alert>  
              }
             </div>
           </Form>
      )
    } else if(apiReturn !== ""){
      return(
          <AccountMadeScreen data={apiReturn}/>
      )
    }else{
      return(<PageLayout>
        <UnauthenticatedTemplate>
          {/* This only displays when user is unathenticated */}
        <p>Sign in to create an account for your guest to use for a limited time.</p>
        </UnauthenticatedTemplate>
      </PageLayout>)
    }//else render something else

}

  