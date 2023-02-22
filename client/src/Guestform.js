import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import React, { useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import './guestForm.css'
import AccountMadeScreen from './AccountMadeScreen';
import { PageLayout } from "./components/PageLayout";
import { useIsAuthenticated } from "@azure/msal-react";
import { UnauthenticatedTemplate, AuthenticatedTemplate } from "@azure/msal-react";
import { useMsal } from "@azure/msal-react";
//import { callMsGraph } from "./graph";
import { loginRequest } from "./authConfig";

//import ProfileContent from './ProfileContent';

// owW8Q~Ie7RqrmC5O82VPCkHsIPWk3Qhgb9dJsaZX

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
      console.log(response)
      token = response;
      // console.log(token)
    } catch (error) {
      console.log(error);
    }
    return Promise.resolve(token);
  }
 

  //state for storing any errors that we want to present to frontend
  const [error, setError] = useState("");

  const [apiReturn, setAPIReturn] = useState("");

  

  //stores our form data inside the USE STATE
  const handleChange = (event) =>{
    setFormData({...formData, [event.target.name]: event.target.value})
  }
  
  const handleSubmit = async (e) =>{
    e.preventDefault();
    
    const token = await requestProfileData();
      if (validateInput(formData)){
        setError(validateInput(formData))
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
    console.log(json)
    axios.post('http://192.168.1.202:5000/formData', json)
      .then(response =>{
          if(response.data.status === "409"){
            console.log('error')
          }else{
            setAPIReturn(response.data)
            console.log(response.data)
          }
          
      })
      .catch(error =>{
        error.toString() === "AxiosError: Network Error" ? setError("Unable to connect to LDAP server") : setError(error.toString());
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
            <AuthenticatedTemplate>

             </AuthenticatedTemplate> 
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
                    <option value={5}>5 Days</option>
                    <optgroup label="For custom time requirements please contact IT Services"></optgroup>
                  </Form.Select>
               </Form.Group>
             <Button variant="primary" type="submit">
               Submit
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

  