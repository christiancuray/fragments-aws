// fragments microservice api to user, default to localhost:8080 if not et in environment
const apiURL = "http://localhost:8080";

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */

export async function getUserFragments(user) {
  console.log("[INFO] Requesting user fragments data ...");
  try {
    const fragmentURL = new URL("/v1/fragments", apiURL);
    const res = await fetch(fragmentURL, {
      /*
            Generate headers with the proper Authorization bearer token to pass.
            We going to use 'authorizationHeader()' helper function to automatically attach the user's idToken
            */
      headers: user.authorizationHeaders(),
    });
    // check if the response is not ok, if so throw an error
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("[SUCCESS] Received user fragments data:", data);
    return data;
  } catch (err) {
    console.error("[ERROR] Unable to get user fragments data:", err);
    throw err;
  }
}
