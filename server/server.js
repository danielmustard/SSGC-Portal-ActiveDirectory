const express = require('express')
require("dotenv")
const cors = require("cors");
const Ldap = require('ldap-async').default
const fs = require('fs');
const checkAuthMiddleware = require('./auth/checkAuthMiddleware');
const app = express()

let port;
let corsClient;

//if in dev mode:
if (process.env.NODE_ENV == 1){
  require("dotenv").config({path:'./.env.dev'})
  port = 5001
  corsClient = "http://localhost:5173"
  console.log("Running in Dev mode")
}else{
  port = 5000
  corsClient = "https://client"
}


//use CA to make tls connection
var tlsOptions = {
  // This is necessary only if the server uses the self-signed certificate
  ca: [ fs.readFileSync('./certs/ca.crt') ]
  };


ldapClient = new Ldap({
    url: process.env.LDAP_URL,
    tlsOptions: tlsOptions,
    bindDN: process.env.AD_USERNAME,
    bindCredentials: process.env.AD_PASSWORD,
    reconnect:{
      initialDelay:100,
      maxDelay:1000,
      failAfter:10
    }
    
  });

  
//allows us to parse incoming json data from body
app.use(express.json());
app.use(cors({ origin: corsClient })); //incoming connection will always come from docker client container


app.listen(port, ()=> {console.log(`Server Started on port ${port}`)})



//middleware, so any incoming request is validated:

app.use(checkAuthMiddleware) //only once azure token has been verified do we move to next step below

app.post('/formData', async (req,res) =>{
  try{
    await makeAdUser(req.body.guest).then((data)=>{
      res.send(data)
    })
  }catch(err){
    console.log(err);
  }
});

 function jsDateToADDate(days) {
  //this function takes a number of days value and then adds that onto current day(today), it then returns a human readable date and AD Epoch time
  //so if today is the first and the function recieves 2, we add on two days from today and work the date out in AD time
   days = parseInt(days);
   //number of days to be active passed into 
   //todays date
   const now = new Date();
   var result = new Date(now);
   result.setDate(result.getDate() + days)
   const HECTONANOSECONDS_TO_MILLISECONDS = 10 * 1000;
   const AD_EPOCH_START = Date.UTC(1601, 0, 1, 0, 0, 0)
   return {
     adTimeValue:(new Date(result).getTime() - AD_EPOCH_START) * HECTONANOSECONDS_TO_MILLISECONDS,
     humanReadableTime:result.toLocaleDateString("en-US",{year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})
   }
 }

 function generatePassword() {
  // Character set to be used for password generation
  const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // Set of special characters to choose from
  const specialChars = '!#$%&()*+,-./:;<=>?@[]^_{}~';
  // Variable to store the generated password
  let randomPassword = '';
  // Loop to generate the password 10 characters long
  for (let i = 0; i < 10; i++) {
    // Generate a random index for the character set
    let randomPoz = Math.floor(Math.random() * charSet.length);
    // Add the character at the randomly generated index to the password
    randomPassword += charSet.substring(randomPoz, randomPoz + 1);
  }
  // Add a random special character to the password
  let randomPoz = Math.floor(Math.random() * specialChars.length);
  randomPassword += specialChars.substring(randomPoz, randomPoz + 1);
  // Return the generated password
  return randomPassword;
}

async function makeAdUser(guest){

  let adDisplayName = `(Guest) ${guest.guestFirstName} ${guest.guestSurname}`

  randomPassword = generatePassword();

  unicodePwd = Buffer.from('"'+randomPassword+'"',"utf16le").toString();

  

  let username = `gst_${guest.guestSurname}${Math.floor(Math.random() * 1001)}`

  const newDN = `cn=${username},${process.env.AD_CONTAINER}`

  let expiryTime = jsDateToADDate(guest.guestTimeActive)

  var entry = {
    displayName: adDisplayName,   
    sAMAccountName: username,   
    name: guest.guestFirstName,
    unicodePwd: unicodePwd,
    userAccountControl:'512', //this makes the account active in AD, by default its disabled
    accountExpires: expiryTime.adTimeValue,
    sn: guest.guestSurname,
    givenName: guest.guestFirstName,
    userPrincipalName: `${username}@dandomain.com`,    
    company: "dandomain.com",   
    info: `GUEST ACCOUNT, Purpose: ${guest.guestPurpose}`,
    department: "GUEST",   
    objectClass: ['organizationalPerson', 'person', 'top', 'user'],
    description: 'Guest account created: ' + (new Date()).toLocaleString()
    }

    let result;
    try{
      await ldapClient.add(newDN,entry).then(()=>{
        result = {
          status: 201,
          username: `${username}`,
          password: `${randomPassword}`,
          accountExpires: expiryTime.humanReadableTime
          }
        ldapClient.close() //need to close connection each time account is made to stop LDAP bind from timing out
      })
    }catch(err){
      result = err;
      console.log(err)
    }
    return result;
  }