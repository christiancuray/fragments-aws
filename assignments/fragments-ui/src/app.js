import { signIn, getUser } from "./auth.js";
import {
  getUserFragments,
  createFragment,
  deleteFragmentById,
  updateFragmentById,
} from "./api.js";

// Import apiURL for use in viewFragment function
const apiURL = import.meta.env.VITE_FRAGMENT_API_URL || "http://localhost:8080";

async function init() {
  // get our UI elements
  const userSection = document.getElementById("user");
  const loginBtn = document.getElementById("login");

  // log in button listener
  loginBtn.addEventListener("click", function () {
    console.log("[INFO] Login button clicked");
    signIn(); // Sign-in via the Amazon Cognito Hosted UI
  });

  // check if we're signed in already, if not return
  const user = await getUser();
  if (!user) return;

  userSection.hidden = false; // show the user section
  userSection.querySelector(".username").innerText = user.username; // display the username
  loginBtn.disabled = true; // disable the Login button
  loginBtn.innerText = "Signed In"; // change button text
  // console.log("[INFO] User is signed in:", user);

  // set up fragment form
  setupFragmentForm(user);

  // set up navigation
  setupNavigation(user);
}

function setupFragmentForm(user) {
  const form = document.getElementById("create-fragment-form");
  const resultDiv = document.getElementById("fragment-result");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const content = document.getElementById("fragment-content").value;
    const contentType = document.getElementById("content-type").value;

    try {
      console.log("[INFO] Creating fragment with content:", content);
      const result = await createFragment(user, content, contentType);

      // Display success message with location
      resultDiv.innerHTML = `
        <h4>Fragment Created Successfully!</h4>
        <div class="fragment-location">
          <h5>Location:</h5>
          <p><strong>${result.location}</strong></p>
        </div>
      `;
      resultDiv.style.display = "block";

      // Clear the form
      form.reset();
    } catch (error) {
      console.error("[ERROR] Failed to create fragment:", error);
      alert("Failed to create fragment: " + error.message);
    }
  });
}

function setupNavigation(user) {
  const viewFragmentsBtn = document.getElementById("view-fragments-btn");
  const backToFormBtn = document.getElementById("back-to-form-btn");
  const fragmentForm = document.getElementById("fragment-form");
  const fragmentsList = document.getElementById("fragments-list");

  viewFragmentsBtn.addEventListener("click", async () => {
    fragmentForm.style.display = "none";
    fragmentsList.style.display = "block";
    await loadUserFragments(user);
  });

  backToFormBtn.addEventListener("click", () => {
    fragmentsList.style.display = "none";
    fragmentForm.style.display = "block";
  });

  // Store user globally for viewFragment function
  window.currentUser = user;
}

async function loadUserFragments(user) {
  try {
    const userFragments = await getUserFragments(user);
    console.log("[INFO] User fragments:", userFragments);

    const container = document.getElementById("fragments-container");
    if (userFragments.fragments && userFragments.fragments.length > 0) {
      // Create a list of fragment IDs with clickable links
      container.innerHTML = userFragments.fragments
        .map(
          (fragmentId) => `
        <div class="fragment-item">
          <strong>Fragment ID:</strong> ${fragmentId}<br>
          <button onclick="viewFragment('${fragmentId}')">View Fragment</button>
        </div>
      `
        )
        .join("");
    } else {
      container.innerHTML = "<p>No fragments found.</p>";
    }
  } catch (error) {
    console.error("[ERROR] Failed to load fragments:", error);
    document.getElementById("fragments-container").innerHTML =
      "<p>Error loading fragments.</p>";
  }
}

// Function to view individual fragment (will be called from the buttons)
window.viewFragment = async function (fragmentId) {
  try {
    const user = window.currentUser;
    if (!user) {
      alert("User not authenticated");
      return;
    }

    // Fetch the fragment from the API
    const fragmentURL = new URL(`/v1/fragments/${fragmentId}`, apiURL);
    const res = await fetch(fragmentURL, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("[SUCCESS] Fragment retrieved:", data);

    // Display the fragment metadata (without location)
    const container = document.getElementById("fragments-container");
    container.innerHTML = `
      <div class="fragment-details">
        <h3>Fragment Details</h3>
        <div class="fragment-content">
          <h4>Content:</h4>
          <pre>${data.fragment.data}</pre>
        </div>
        <div class="fragment-metadata">
          <h4>Metadata:</h4>
          <pre>${JSON.stringify(data.fragment, null, 2)}</pre>
        </div>
        <div class="fragment-actions">
          <button onclick="editFragment('${fragmentId}')">Edit</button>
          <button onclick="deleteFragment('${fragmentId}')">Delete</button>
          <button onclick="backToFragmentsList()">Back</button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("[ERROR] Failed to load fragment:", error);
    alert("Failed to load fragment: " + error.message);
  }
};

console.log("[INFO] App initialized");

// Function to delete a fragment
window.deleteFragment = async function (fragmentId) {
  try {
    const user = window.currentUser;
    if (!user) {
      alert("User not authenticated");
      return;
    }

    // Confirm deletion
    if (!confirm("Are you sure you want to delete this fragment?")) {
      return;
    }

    console.log("[INFO] Deleting fragment:", fragmentId);
    await deleteFragmentById(user, fragmentId);

    alert("Fragment deleted successfully!");

    // Go back to fragments list
    backToFragmentsList();
  } catch (error) {
    console.error("[ERROR] Failed to delete fragment:", error);
    alert("Failed to delete fragment: " + error.message);
  }
};

// Function to edit a fragment
window.editFragment = async function (fragmentId) {
  try {
    const user = window.currentUser;
    if (!user) {
      alert("User not authenticated");
      return;
    }

    // Fetch the fragment that will be edited
    const fragmentURL = new URL(`/v1/fragments/${fragmentId}`, apiURL);
    const res = await fetch(fragmentURL, {
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const fragment = data.fragment;

    // Display edit form
    const container = document.getElementById("fragments-container");
    container.innerHTML = `
      <div class="fragment-edit">
        <h3>Edit Fragment</h3>
        <form id="edit-fragment-form">
          <div>
            <label>Content Type:</label>
            <p><strong>${fragment.type}</strong> (Cannot be changed)</p>
          </div>
          <div>
            <label for="edit-content">Content:</label>
            <textarea id="edit-content" required>${fragment.data}</textarea>
          </div>
          <div>
            <button type="submit">Update Fragment</button>
            <button type="button" onclick="backToFragmentsList()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    // Update fragment button listener.
    document
      .getElementById("edit-fragment-form")
      .addEventListener("submit", async function (e) {
        e.preventDefault();
        const newContent = document.getElementById("edit-content").value;

        try {
          console.log("[INFO] Updating fragment:", fragmentId);

          await updateFragmentById(user, fragmentId, newContent, fragment.type);

          // Reload the fragment view
          viewFragment(fragmentId);
        } catch (error) {
          console.error("[ERROR] Failed to update fragment:", error);
          alert("Failed to update fragment: " + error.message);
        }
      });
  } catch (error) {
    console.error("[ERROR] Failed to load fragment for editing:", error);
    alert("Failed to load fragment: " + error.message);
  }
};

// Function to go back to fragments list
window.backToFragmentsList = function () {
  const fragmentForm = document.getElementById("fragment-form");
  const fragmentsList = document.getElementById("fragments-list");
  fragmentsList.style.display = "block";
  fragmentForm.style.display = "none";
  loadUserFragments(window.currentUser);
};

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
