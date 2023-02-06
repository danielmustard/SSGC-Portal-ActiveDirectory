import React, { Component, useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form';

//function to send form data to backend server
class AccountMadeScreen extends Component {
    
    render() {
        
        //can put other js logic here that wont be rendered but will be interacted with

      return (
        <Form className="MainForm" onSubmit={this.submitHandler} autoComplete='off' autoCapitalize='off' autoCorrect='off'>
        <div className="FormElements">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Guest Username:</Form.Label>
            <Form.Control
              type="text"
              readOnly
              name="guestFirstName"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Guest Password:</Form.Label>
            <Form.Control
              type="text"
              readOnly
              name="guestFirstName"
            />

          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Account Active Until:</Form.Label>
            <Form.Control
              type="date"
              readOnly
              name="guestFirstName"
            />
          </Form.Group>

       </div>
     </Form>
        
        
        
            
        
      )
     }
   }
  
  
  export default AccountMadeScreen;