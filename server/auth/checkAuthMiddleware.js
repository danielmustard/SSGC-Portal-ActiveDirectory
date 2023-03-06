const checkAuth = require('./checkAuth');
require('dotenv')

module.exports = async (req,res,next) => {
    let decodedAndVerified = null;
    try {
        idToken = req.body.azureToken
        console.log(process.env.AZURE_APPLICATION_ID)
        //let idToken = auth.substring(7);//removes "Bearer " from the Authorization header
        let result = await checkAuth(idToken); //await the result of our authentication check
        
        if(!result || result.aud !== process.env.AZURE_APPLICATION_ID){
            throw Error("Invalid token.")
        }
        req.userData = result;//assuming no error was thrown and we recieved a token, it should be valid so let's attach it for future middleware 
        next();
    }
    catch (err) {
        return res.status(401).json({//if an error occurred just respond with an unauthorized response.
            message: 'Auth failed'
        })
    }
}