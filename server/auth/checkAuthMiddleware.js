const checkAuth = require('./checkAuth');

module.exports = async (req,res,next) => {
    let decodedAndVerified = null;
    try {
        idToken = req.body.azureToken

        //make sure that token comes from our Azure application ID,
        const Azure_aud = "923f0d56-47a2-4677-a426-9dea5042cdf8"

        //let idToken = auth.substring(7);//removes "Bearer " from the Authorization header
        let result = await checkAuth(idToken); //await the result of our authentication check

        if(!result || result.aud !== Azure_aud){
            throw Error("Invalid token.")
        }
        req.userData = result;//assuming no error was thrown and we recieved a token, it should be valid so let's attach it for future middleware 
        next();
    }
    catch (err) {
        console.log(err)
        return res.status(401).json({//if an error occurred just respond with an unauthorized response.
            message: 'Auth failed'
        })
    }
}