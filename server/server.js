const express = require('express')
const cors = require("cors");
const Ldap = require('ldap-async').default
const fs = require('fs');
const checkAuthMiddleware = require('./auth/checkAuthMiddleware');
const app = express()

const dn = "CN=guestAdmin2,OU=Guests,DC=dandomain,DC=com"
  
const bindPassword = "Pscxkufx1"

//use CA to make tls connection
var tlsOptions = {
  // This is necessary only if the server uses the self-signed certificate
  ca: [ fs.readFileSync('./certs/ca.crt') ]
  };

const ldapClient = new Ldap({
  url: 'ldaps://dandc1.dandomain.com',
  tlsOptions: tlsOptions,
  bindDN: dn,
  bindCredentials: bindPassword,
  reconnect: true, //if connection is lost with ldap server we auto reconnect
})

//allows us to parse incoming json data from body
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.listen(5000, ()=> {console.log("Server Started on port 5000")})

//middleware, so any incoming request is validated:

app.use(checkAuthMiddleware) //only once azure token has been verified do we move to next step below

app.post('/formData', async (req,res) =>{
  await makeAdUser(req.body.guest)
  // await makeUser(req.body.guest).then (data =>{
  //   res.send(data)
  // })
});


 function jsDateToADDate(days) {
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

// async function makeUser(guest){
//     let adDisplayName = `(Guest) ${guest.guestFirstName} ${guest.guestSurname}`

//     //including a random integer at end of guest account to avoid possible clashes
//     let username = `gst_${guest.guestSurname}${Math.floor(Math.random() * 1001)}`

//     let expiryTime = jsDateToADDate(guest.guestTimeActive)

//     console.log(expiryTime)
//     randomPassword = generatePassword();
    
//     //console.log(password())
//     //need to use unicode password to send to AD:
//     unicodePwd = Buffer.from('"'+randomPassword+'"',"utf16le").toString();
    
//     //data to pass to AD: , we cannot
//      var entry = {
//          displayName: adDisplayName,   
//          sAMAccountName: username,   
//          name: guest.guestFirstName,
//          unicodePwd: unicodePwd,
//          userAccountControl:'512', //this makes the account active
//          accountExpires: expiryTime.adTimeValue,
//          sn: guest.guestSurname,
//          givenName: guest.guestFirstName,
//          userPrincipalName: `${username}@dandomain.com`,    
//          company: "dandomain.com",   
//          info: `GUEST ACCOUNT, Purpose: ${guest.purposeOfAccess}`,
//          department: "GUEST",   
//          objectClass: ['organizationalPerson', 'person', 'top', 'user'],
//          description: 'Guest account created: ' + (new Date()).toLocaleString()
//        }
//       //new user DN decides ou that user will go into, this case we have OU called GUEST
//       const newDN = `cn=${adDisplayName},OU=Guests,DC=dandomain,DC=com`
      
//       //passing credentials
//       client.bind('CN=guestAdmin2,OU=Guests,DC=dandomain,DC=com', 'Pscxkufx1', (err) => {
//         if (err){
//             console.log(err)
//             err + errorLog;
//         }else{
//             console.log("Binded to LDAP using provided credentials")
//         }
//       });

//        client.add ( newDN, entry, (error)=>{
//          // console.log(result)
//          if (error){
//            console.log(error.toString())
//            errorLog = error.toString();
//          }else{
//            console.log('Generated account with no errors')
//            errorLog = false //no errors so we update error log
//            //closing connection with ldap server, prevents timeout crash from server
//            client.unbind()
//            client.destroy();
//          }
//        });
//       //handling any ldap client connection error (stops server from crashing if AD terminated LDAP connection)
//       client.on('error', (err) => {
//         // this will be your ECONNRESET message
//         errorLog = err.toString();        
//       })
      
//   if (errorLog == false){
//     return {
//       status: 201,
//       username: `${username}`,
//       password: `${randomPassword}`,
//       accountExpires: expiryTime.humanReadableTime
//     }
    
//   }else{
//     return {
//       status: 409
//     }
//   }
// }

async function makeAdUser(guest){

  let adDisplayName = `(Guest) ${guest.guestFirstName} ${guest.guestSurname}`

  randomPassword = generatePassword();

  unicodePwd = Buffer.from('"'+randomPassword+'"',"utf16le").toString();

  const newDN = `cn=${adDisplayName},OU=Guests,DC=dandomain,DC=com`

  let username = `gst_${guest.guestSurname}${Math.floor(Math.random() * 1001)}`

  let expiryTime = jsDateToADDate(guest.guestTimeActive)

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

    try{
      ldapClient.add(newDN,entry)
    }catch(err){
      console.log(err)
    }
}
    