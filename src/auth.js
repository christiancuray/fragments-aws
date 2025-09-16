import { UserManager } from "oidc-client-ts";

const cognitoAuthConfig = {
  authority: `${import.meta.env.VITE_API_URL}/${
    import.meta.env.VITE_AWS_COGNITO_POOL_ID
  }`,
  client_id: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_OAUTH_SIGN_IN_REDIRECT_URL,
  response_type: "code",
  scope: "phone openid email",
  revokeTokenTypes: ["refresh_token"], // no revoke of "access token" ([URL]
  automaticSilentRenew: false, // no silent renew via "prompt=none" ([URL]
};

// Create a UserManager instance
const userManager = new UserManager({
  ...cognitoAuthConfig,
});

export async function signIn() {
  // redirect to the Cognito auth page for sign-in
  await userManager.signinRedirect();
}

// Create a simplified view of the user object
function formatUser(user) {
  console.log("User Authenticated", { user });
  return {
    username: user.profile["cognito:username"],
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
    authorizationHeaders: (type = "application/json") => ({
      "Content-Type": type,
      Authorization: `Bearer ${user.id_token}`,
    }),
  };
}

// Get the current user, handling the redirect callback if needed
export async function getUser() {
  // First, check if we're handling a signin redirect callback (e.g., is ?code=... in URL)
  if (window.location.search.includes("code=")) {
    const user = await userManager.signinCallback();
    // Remove the auth code from the URL without triggering a reload
    window.history.replaceState({}, document.title, window.location.pathname);
    return formatUser(user);
  }

  // Otherwise, get the current user
  const user = await userManager.getUser();
  return user ? formatUser(user) : null;
}
