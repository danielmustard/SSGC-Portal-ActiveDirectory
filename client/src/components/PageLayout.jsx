import React from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import { SignInButton } from "./SignInButton";
import '../guestForm.css'

/**
 * Renders the navbar component with a sign-in button if a user is not authenticated
 */
export const PageLayout = (props) => {
    const isAuthenticated = useIsAuthenticated();

    return (
        <>
            <div style={{display:"flex", justifyContent:"center", flexDirection:"column",alignItems:"center", height:"100vh"}}>
                <h1 class="display-2">Self Service Guest Portal</h1>
                { isAuthenticated ? <span>Signed In</span> : <SignInButton /> }
                {props.children}
            </div>
            
        </>
    );
};