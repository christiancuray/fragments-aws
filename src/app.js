import { signIn, getUser } from "./auth.js";

async function init() {
  // Get our UI elements
  const userSection = document.getElementById("user");
  const loginBtn = document.getElementById("login");

  // Wire up event handlers to deal with login and logout.
  loginBtn.addEventListener("click", function () {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  });

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    return;
  }

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
