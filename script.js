// ===============================
// FIREBASE IMPORTS (MODERN SDK)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===============================
// CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyD91XfKDdN4e9HXTEUlMZgVykG3ITAQ8NM",
  authDomain: "xolii-web.firebaseapp.com",
  projectId: "xolii-web",
  storageBucket: "xolii-web.firebasestorage.app",
  messagingSenderId: "478461534020",
  appId: "1:478461534020:web:267db318833ac2fdc68111",
  measurementId: "G-H53L21CFXJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// UI ELEMENTS
// ===============================
const btn = document.getElementById("continueBtn");
const input = document.getElementById("userInput");
const popup = document.getElementById("popup");
const mainSite = document.getElementById("main-site");

// ===============================
// INIT STATE
// ===============================
auth.languageCode = "en";

// ===============================
// EVENT LISTENER (FIXES YOUR BUTTON)
// ===============================
btn.addEventListener("click", handleAuth);

// ===============================
// MAIN AUTH CONTROLLER
// ===============================
async function handleAuth() {
  const value = input.value.trim();

  if (!value) {
    alert("Enter email or phone number");
    return;
  }

  await setPersistence(auth, browserLocalPersistence);

  // ===========================
  // EMAIL FLOW
  // ===========================
  if (value.includes("@")) {
    const actionCodeSettings = {
      url: window.location.href,
      handleCodeInApp: true
    };

    try {
      await sendSignInLinkToEmail(auth, value, actionCodeSettings);

      window.localStorage.setItem("emailForSignIn", value);

      await addDoc(collection(db, "visitors"), {
        type: "email",
        value,
        time: Date.now()
      });

      alert("Email link sent 📩 Check inbox");

    } catch (err) {
      console.error(err);
      alert("Email error: " + err.message);
    }
  }

  // ===========================
  // PHONE FLOW
  // ===========================
  else {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible"
          }
        );
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        value,
        window.recaptchaVerifier
      );

      const code = prompt("Enter OTP sent to your phone:");

      if (!code) {
        alert("OTP required");
        return;
      }

      await confirmation.confirm(code);

      await addDoc(collection(db, "visitors"), {
        type: "phone",
        value,
        time: Date.now()
      });

      successLogin("Phone verified");

    } catch (err) {
      console.error(err);
      alert("Phone error: " + err.message);

      // reset recaptcha safely
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  }
}

// ===============================
// SUCCESS LOGIN HANDLER
// ===============================
function successLogin(message) {
  popup.style.display = "none";
  mainSite.style.display = "block";
  document.body.style.overflow = "auto";

  alert(message + " ✅");
}

// ===============================
// EMAIL LINK LOGIN (AUTO CHECK)
// ===============================
window.addEventListener("load", async () => {
  document.querySelector(".loader").style.display = "none";
  document.body.style.overflow = "hidden";

  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = localStorage.getItem("emailForSignIn");

    if (!email) {
      email = prompt("Confirm email again:");
    }

    try {
      await signInWithEmailLink(auth, email, window.location.href);
      successLogin("Email verified");
    } catch (err) {
      alert("Email login error: " + err.message);
    }
  }
});
