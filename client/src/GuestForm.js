import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import React, { Component,} from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css';
import './guestForm.css'


//function to send form data to backend server


class GuestForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      guestFirstName: '',
      guestSurname: '',
      purposeOfAccess: '',
      guestLocation: '',
      accountDuration: '',
      //state value for data returned from express
      apiResponse:{}
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  

  submitHandler = event => {
    event.preventDefault();
    //for logging state data
    //console.log(this.state)
    //if any of the values are blank we want to prompt the user with a warning.
    //take data from the state object and post it to backend
    axios.post('http://192.168.1.202:5000/formData', (this.state))
      .then (response =>{
        console.log(response.data.username)
        this.setState({
          response:response
        })
      }).catch(error =>{
        console.log(error)
      })
      
  };
  
  render() {
    const { guestFirstName, guestSurname, purposeOfAccess, guestLocation, accountDuration } = this.state;
      return (
        <Form className="MainForm" onSubmit={this.submitHandler} autoComplete='off' autoCapitalize='off' autoCorrect='off'>
          <Alert key="warning" variant="warning">
            By completing this form you and your guest both agree to the IT Acceptable use policy (Link Here)
          </Alert>
          <div className="FormElements">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Guest First Name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Guest First Name"
                onChange={this.handleChange}
                value={guestFirstName}
                name="guestFirstName"
              />
            </Form.Group>
  
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Guest Surname:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Guest Name"
                onChange={this.handleChange}
                value={guestSurname}
                name="guestSurname"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Purpose of Access:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Purpose of access"
                onChange={this.handleChange}
                value={purposeOfAccess}
                name="purposeOfAccess"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Guest Location:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Guest Location"
                onChange={this.handleChange}
                value={guestLocation}
                name="guestLocation"
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
                onChange={this.handleChange}
                value={accountDuration}
                name="accountDuration"
                placeholder='Duration' 
              >
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
         </div>
       </Form>
       )
   }
 }


export default GuestForm;