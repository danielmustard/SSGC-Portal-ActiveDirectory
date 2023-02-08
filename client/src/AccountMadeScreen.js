import React from 'react'
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
//function to send form data to backend server

export default function AccountMadeScreen(apiData){
      return (
          <Form className="AccountMadeForm" autoComplete='off' autoCapitalize='off' autoCorrect='off'>
            <h1>{apiData.username}</h1>
        <h1>Guest Account Created</h1>
        <Alert key="success" variant="success">
                We have created your guest account with the information below, please note this screen will only be displayed once.
              </Alert>
            <div className="FormElements">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Guest Username:</Form.Label>
                <Form.Control
                  type="text"
                  value={apiData.data.username}
                  readOnly={true}
                />
              </Form.Group>
  
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Guest Account Password</Form.Label>
                <Form.Control
                  type="text"
                  value={apiData.data.password}
                  readOnly={true}           
                />
              </Form.Group>              
           </div>
         </Form>    
      )
   }