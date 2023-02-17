const express = require('express')
const cors = require("cors");
const ldap = require('ldapjs')
const fs = require('fs');
const checkAuth = require('./auth/checkAuthMiddleware');
const checkAuthMiddleware = require('./auth/checkAuthMiddleware');

const app = express()

//allows us to parse incoming json data from body
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.listen(5000, ()=> {console.log("Server Started on port 5000")})

app.post('/formData',(req,res) =>{
  checkAuth,(res,req,next)
  checkAuthMiddleware(req.body,res,next)
});

// async (req, res) =>{
//   console.log(req.body);
// })
  //  await makeUser(req.body).then (data =>{
  //    res.send(data)
  //  })

//User should only be able to perform any of the steps below after they have authenticated with AAD, !SET THIS UP LATER

function jsDateToADDate(days) {
  console.log(days)
  days = parseInt(days);
  //number of days to be active passed into 
  //todays date
  const now = new Date();
  var result = new Date(now);
  result.setDate(result.getDate() + days);

  const HECTONANOSECONDS_TO_MILLISECONDS = 10 * 1000;
  const AD_EPOCH_START = Date.UTC(1601, 0, 1, 0, 0, 0);

  return {
    adTimeValue:(new Date(result).getTime() - AD_EPOCH_START) * HECTONANOSECONDS_TO_MILLISECONDS,
    humanReadableTime:result.toLocaleDateString("en-US",{year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})
  }
  
}

async function makeUser(guest){
    console.log(guest)
    let errorLog;
    let adDisplayName = `(Guest) ${guest.guestFirstName} ${guest.guestSurname}`

    //including a random integer at end of guest account to avoid possible clashes
    let username = `gst_${guest.guestSurname}${Math.floor(Math.random() * 1001)}`

    let expiryTime = jsDateToADDate(guest.guestTimeActive)

    console.log(expiryTime)

    function generatePassword() {
      // Character set to be used for password generation
      const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      // Variable to store the generated password
      let randomPassword = '';
      // Loop to generate the password 8 characters long
      for (let i = 0; i < 11; i++) {
        // Generate a random index for the character set
        let randomPoz = Math.floor(Math.random() * charSet.length);
        // Add the character at the randomly generated index to the password
        randomPassword += charSet.substring(randomPoz, randomPoz + 1);
      }
      // Return the generated password
      return randomPassword;
    }
    
    randomPassword = generatePassword();
    
    //console.log(password())
    //need to use unicode password to send to AD:
    unicodePwd = Buffer.from('"'+randomPassword+'"',"utf16le").toString();
    
    //data to pass to AD: , we cannot
     var entry = {
         displayName: adDisplayName,   
         sAMAccountName: username,   
         name: guest.guestFirstName,
         unicodePwd: unicodePwd,
         userAccountControl:'512', //this makes the account active
         accountExpires: expiryTime.adTimeValue,
         sn: guest.guestSurname,
         givenName: guest.guestFirstName,
         userPrincipalName: `${username}@dandomain.com`,    
         company: "dandomain.com",   
         info: `GUEST ACCOUNT, Purpose: ${guest.purposeOfAccess}`,
         department: "GUEST",   
         objectClass: ['organizationalPerson', 'person', 'top', 'user'],
         description: 'Guest account created: ' + (new Date()).toLocaleString()
       }
      //new user DN decides ou that user will go into, this case we have OU called GUEST
      const newDN = `cn=${adDisplayName},OU=Guests,DC=dandomain,DC=com`
      
      //use CA to make tls connection
      var tlsOptions = {
        // This is necessary only if the server uses the self-signed certificate
        ca: [ fs.readFileSync('./certs/ca.crt') ]
        };
      //making connection with ldap server
      const client = ldap.createClient({
        url: 'ldaps://dandc1.dandomain.com',
        tlsOptions: tlsOptions,
        reconnect: true //if connection is lost with ldap server we auto reconnect
      });
      //passing credentials
      client.bind('CN=guestAdm,OU=Guests,DC=dandomain,DC=com', 'Pscxkufx1', (err) => {
        if (err){
            console.log(err)
            err + errorLog;
        }else{
            console.log("Binded to LDAP using provided credentials")
        }
      });

       client.add ( newDN, entry, (error)=>{
         // console.log(result)
         if (error){
           console.log(error.toString())
           errorLog = error.toString();
         }else{
           console.log('Generated account with no errors')
           //closing connection with ldap server, prevents timeout crash from server
           client.unbind()
           client.destroy();
         }
       });
      //handling any ldap client connection error (stops server from crashing if AD terminated LDAP connection)
      client.on('error', (err) => {
        // this will be your ECONNRESET message
        errorLog = err.toString();        
      })
  if (errorLog == null){
    return {
      status: 201,
      username: `${username}`,
      password: `${randomPassword}`,
      accountExpires: expiryTime.humanReadableTime
    }
    
  }else{
    return {
      status: 409
    }
  }
}
