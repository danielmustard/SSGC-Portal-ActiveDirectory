const express = require('express')
const cors = require("cors");
const ldap = require('ldapjs')
const fs = require('fs')
const https = require('https')


const app = express()

//allows us to parse incoming json data from body
app.use(express.json());

app.use(cors({ origin: "http://localhost:3000" }));

app.listen(5000, ()=> {console.log("Server Started on port 5000")})

app.post('/formData',async (req, res) =>{
  await makeUser(req.body).then (data =>{
    res.send(data)
  })
})

//User should only be able to perform any of the steps below after they have authenticated with AAD, !SET THIS UP LATER

const adDateCalcFunction = (timeValue) =>{
  //account will expire 4:00pm next day which is 12:00am GMT meaning for example somone requests 
  // a guest account on a monday morning it will expire on the Tuesday at 12:00am

  //ad time calc is strange, we need to workout the value between jan 1st 1601 and now in 100NanosecondIntervals and this is the value that AD stores for expiry
  let num = 0;
  if (timeValue == "1 Day"){
      num = 3        
  }else if(timeValue == "2 Days"){
      num = 4
  }else if (timeValue == "5 Days"){
      num = 6
  }
  var today = new Date();
  today.setDate(today.getDate() + num);
  today.setHours(0, 0, 0, 0);
  var tzDifference = today.getTimezoneOffset();
  today.setMinutes(today.getMinutes() + tzDifference);
  var january1st1601 = new Date(Date.UTC(1601, 0, 1));
  var differenceInMilliseconds = today - january1st1601;
  var differenceIn100NanosecondIntervals = differenceInMilliseconds * 10000;
  return differenceIn100NanosecondIntervals;
}


async function makeUser(guest){
    let errorLog;
    let adDisplayName = `(Guest) ${guest.guestFirstName} ${guest.guestSurname}`

    //including a random integer at end of guest account to avoid possible clashes
    let username = `gst_${guest.guestSurname}${Math.floor(Math.random() * 1001)}`

    let password = "rayate7ubU-r"
    //need to use unicode password to send to AD:
    unicodePwd = Buffer.from('"'+password+'"',"utf16le").toString();
    
    //data to pass to AD: , we cannot 
    var entry = {
        displayName: adDisplayName,   
        sAMAccountName: username,   
        name: guest.guestFirstName,
        unicodePwd: unicodePwd,
        userAccountControl:'512', //this makes the account active
        accountExpires: adDateCalcFunction(guest.accountDuration),
        sn: guest.guestSurname,
        givenName: guest.guestFirstName,
        userPrincipalName: `${username}@dandomain.com`,    
        company: "dandomain.com",   
        info: `GUEST ACCOUNT, Purpose: ${guest.purposeOfAccess}`,
        department: "GUEST",   
        objectClass: ['organizationalPerson', 'person', 'top', 'user'],
        //objectCategory: personCategory,
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

      client.add ( newDN, entry, (err, result)=>{
        // console.log(result)
        if (err){
          console.log(err)
          err + errorLog;
        }else{
        }
      });

      //closing connection with ldap server, prevents timeout crash from server
      client.unbind();
  if (errorLog == null){
    return {
      status: 'Account Made successfully',
      username: `${username}`,
      password: `${password}`
    }
  }else{
    return {
      status: 'Error Processing request'
    }
  }
}
