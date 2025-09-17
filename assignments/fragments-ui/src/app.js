import { signIn, getUser } from "./auth.js";
import { getUserFragments } from "./api.js";

async function init() {
  // Get our UI elements
  const userSection = document.getElementById("user");
  const loginBtn = document.getElementById("login");

  // log in button listener
  loginBtn.addEventListener("click", function () {
    console.log("[INFO] Login button clicked");
    signIn(); // Sign-in via the Amazon Cognito Hosted UI
  });

  // See if we're signed in already
  const user = await getUser();
  if (!user) return;

  userSection.hidden = false; // show the user section
  userSection.querySelector(".username").innerText = user.username; // display the username
  loginBtn.disabled = true; // disable the Login button
  console.log("[INFO] User is signed in:", user);

  const userFragments = await getUserFragments(user);
  console.log("[INFO] User fragments:", userFragments);
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
