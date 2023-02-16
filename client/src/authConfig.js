export const msalConfig = {
    auth: {
      clientId: "923f0d56-47a2-4677-a426-9dea5042cdf8",
      authority: "https://login.microsoftonline.com/832d814b-b790-4ea3-981d-6b2e6af9794c", // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: "http://localhost:3000",
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
  
  // This gets us the 'guest create token' we can then try to 
  export const loginRequest = {
   scopes: ["api://923f0d56-47a2-4677-a426-9dea5042cdf8/guest.create"]
  };
  
  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
  };