import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import React, { useState } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import './guestForm.css'
import Collapse from 'react-bootstrap/Collapse';


export default function GuestForm(){
  //state for storing our form data
  const [formData, setFormData] = useState({
    guestFirstName: '',
    guestSurname: '',
    guestPurpose:'',
    guestLocation:'',
    guestTimeActive:''
  })

  //state for storing any errors that we want to present to frontend
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  //stores our form data inside the USE STATE
  const handleChange = (event) =>{
    setFormData({...formData, [event.target.name]: event.target.value})
  }

  const handleSubmit = (event) =>{
    event.preventDefault();
    //validate incoming data, check if any values are empty
    if (validateInput(formData)){
      setError(validateInput(formData))
      setOpen(!open);
    }else{
      //here we run our axios code to submit our data to API
      postData(formData)
    }
  }

  //after our form data input has been validated we then post the data to our endpoint
  const postData = async(data) =>{
    axios.post('http://192.168.1.202:5000/formData', formData)
      .then(response =>{
        console.log(response.data)
      })
  } 

  const validateInput = (data) =>{
    for(var key in data) {
      if(data[key] === "") {
         return("Please fill all form fields!")
      }
  }}


  return(
    <Form className="MainForm" autoComplete='off' autoCapitalize='off' autoCorrect='off' onSubmit={handleSubmit}>
      <h1>Self Service Guest Portal</h1>
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
                <option>1 Day</option>
                <option>2 Days</option>
                <option>5 Days</option>
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

}

  