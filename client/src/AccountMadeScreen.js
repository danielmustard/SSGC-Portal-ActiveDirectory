import React from 'react'
import Form from 'react-bootstrap/Form';
//function to send form data to backend server

export default function AccountMadeScreen(data){
  console.log(data)
      return (
          <Form className="MainForm" autoComplete='off' autoCapitalize='off' autoCorrect='off'>
        <h1>Guest Account Created</h1>
            <div className="FormElements">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Guest First Name:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Guest First Name"
                />
              </Form.Group>
  
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Guest Surname:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Guest Name"              
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Purpose of Access:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Purpose of access"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Guest Location:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Guest Location"
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
                  name="guestTimeActive">
                  <option key = 'blankChoice' hidden value> --Select Duration-- </option>
                  <option>1 Day</option>
                  <option>2 Days</option>
                  <option>5 Days</option>
                  <optgroup label="For custom time requirements please contact IT Services"></optgroup>
                </Form.Select>
             </Form.Group>
           </div>
         </Form>    
      )
   }