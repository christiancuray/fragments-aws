// fragments microservice api to user, default to localhost:8080 if not set in environment
const apiURL = import.meta.env.VITE_FRAGMENT_API_URL || "http://localhost:8080";

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

/**
 * Create a new fragment for the authenticated user
 */
export async function createFragment(
  user,
  content,
  contentType = "text/plain"
) {
  console.log("[INFO] Creating new fragment...");
  try {
    const fragmentURL = new URL("/v1/fragments", apiURL);
    const res = await fetch(fragmentURL, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${user.idToken}`,
      },
      body: content,
    });

    // check if the response is not ok, if so throw an error
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const location = res.headers.get("Location");

    console.log("[SUCCESS] Fragment created successfully:", data);
    console.log("[SUCCESS] Location header:", location);

    return { data, location };
  } catch (err) {
    console.error("[ERROR] Unable to create fragment:", err);
    throw err;
  }
}
