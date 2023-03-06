export const msalConfig = {
    auth: {
      clientId: import.meta.env.VITE_APPLICATION_ID,
      authority: `https://login.microsoftonline.com/${import.meta.env.VITE_TENANT_ID}`, // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: import.meta.env.BASE_URL,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: "sessionStorage", // This configures where your cache will be stored
      storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
    }
  };
  
  // This gets us the 'guest create token' we can then try to 
  export const loginRequest = {
   scopes: [import.meta.env.VITE_API_SCOPE]
  };
  
  // Add the endpoints here for Microsoft Graph API services you'd like to use.
  export const graphConfig = {
      graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
  };