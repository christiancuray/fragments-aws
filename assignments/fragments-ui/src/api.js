// fragments microservice api to user, default to localhost:8080 if not set in environment
const apiURL = import.meta.env.VITE_FRAGMENT_API_URL || "http://localhost:8080";

// get user fragments
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

// get expanded user fragments
export async function getExpandedUserFragments(user) {
  console.log("[INFO] Requesting expanded user fragments data ...");
  try {
    const fragmentURL = new URL("/v1/fragments?expand=1", apiURL);
    const res = await fetch(fragmentURL, {
      headers: user.authorizationHeaders(),
    });

    // check if the response is not ok, if so throw an error
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("[SUCCESS] Received expanded user fragments data:", data);
    return data;
  } catch (err) {
    console.error("[ERROR] Unable to get expanded user fragments data:", err);
    throw err;
  }
}

// create a new fragment
export async function createFragment(user, content, contentType) {
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

// get a fragment by id
export async function getFragmentById(user, fragmentId) {
  console.log("[INFO] Requesting fragment by id:", fragmentId);
  try {
    const fragmentURL = new URL(`/v1/fragments/${fragmentId}`, apiURL);
    const res = await fetch(fragmentURL, {
      headers: user.authorizationHeaders(),
    });

    // check if the response is not ok, if so throw an error
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("[SUCCESS] Received fragment by id:", data);
    return data;
  } catch (err) {
    console.error("[ERROR] Unable to get fragment by id:", err);
    throw err;
  }
}

// get a converted fragment by id
export async function getConvertedFragmentById(user, fragmentId, ext) {
  console.log("[INFO] Requesting converted fragment by id:", fragmentId);
  try {
    const fragmentURL = new URL(`/v1/fragments/${fragmentId}.${ext}`, apiURL);
    const res = await fetch(fragmentURL, {
      headers: user.authorizationHeaders(),
    });

    // check if the response is not ok, if so throw an error
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("[SUCCESS] Received converted fragment by id:", data);
    return data;
  } catch (err) {
    console.error("[ERROR] Unable to get converted fragment by id:", err);
    throw err;
  }
}

// delete a fragment by id
export async function deleteFragmentById(user, fragmentId) {
  console.log("[INFO] Deleting fragment by id:", fragmentId);
  try {
    const fragmentURL = new URL(`/v1/fragments/${fragmentId}`, apiURL);
    const res = await fetch(fragmentURL, {
      method: "DELETE",
      headers: user.authorizationHeaders(),
    });

    // check if the response is not ok, if so throw an error
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("[SUCCESS] Fragment deleted successfully:", data);
    return data;
  } catch (err) {
    console.error("[ERROR] Unable to delete fragment:", err);
    throw err;
  }
}

// update a fragment by id
export async function updateFragmentById(
  user,
  fragmentId,
  content,
  contentType
) {
  console.log("[INFO] Updating fragment by id:", fragmentId);
  try {
    const fragmentURL = new URL(`/v1/fragments/${fragmentId}`, apiURL);
    const res = await fetch(fragmentURL, {
      method: "PUT",
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
    console.log("[SUCCESS] Fragment updated successfully:", data);
    return data;
  } catch (err) {
    console.error("[ERROR] Unable to update fragment:", err);
    throw err;
  }
}
