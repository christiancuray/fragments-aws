import { signIn, getUser } from "./auth.js";

async function init() {
  // Get our UI elements
  const userSection = document.getElementById("user");
  const loginBtn = document.getElementById("login");

  // log in button listener
  loginBtn.addEventListener("click", function () {
    signIn(); // Sign-in via the Amazon Cognito Hosted UI
  });

  // See if we're signed in already
  const user = await getUser();
  if (!user) return;

  // show the user section
  userSection.hidden = false;

  // display the username
  userSection.querySelector(".username").innerText = user.username;

  // disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
