// ===============================
// FIREBASE IMPORTS (MODULAR)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===============================
// FIREBASE CONFIG
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

auth.languageCode = "en";

// ===============================
// UI ELEMENTS
// ===============================
const btn = document.getElementById("continueBtn");
const input = document.getElementById("userInput");
const popup = document.getElementById("popup");
const mainSite = document.getElementById("main-site");

// ===============================
// INIT
// ===============================
window.addEventListener("load", () => {
  document.querySelector(".loader").style.display = "none";
  document.body.style.overflow = "hidden";
});

// BUTTON FIX (THIS WAS YOUR MAIN ISSUE)
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
  // EMAIL / PASSWORD FLOW (FIXED)
  // ===========================
  if (value.includes("@")) {
    const password = "defaultPassword123"; // simple fallback system

    try {
      // try login first
      await signInWithEmailAndPassword(auth, value, password);

      await logVisitor("email", value);
      successLogin("Welcome back 👋");

    } catch (err) {
      // if user doesn't exist → create account
      if (err.code === "auth/user-not-found" ||
          err.code === "auth/invalid-credential") {

        try {
          await createUserWithEmailAndPassword(auth, value, password);

          await logVisitor("email", value);
          successLogin("Account created ✅");

        } catch (createErr) {
          alert(createErr.message);
        }

      } else {
        alert(err.message);
      }
    }
  }

  // ===========================
  // PHONE OTP FLOW (FIXED)
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

      const code = prompt("Enter OTP sent to your phone");

      if (!code) {
        alert("OTP required");
        return;
      }

      await confirmation.confirm(code);

      await logVisitor("phone", value);
      successLogin("Phone verified ✅");

    } catch (err) {
      console.error(err);
      alert(err.message);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  }
}

// ===============================
// FIRESTORE LOGGING
// ===============================
async function logVisitor(type, value) {
  try {
    await addDoc(collection(db, "visitors"), {
      type,
      value,
      time: Date.now()
    });
  } catch (err) {
    console.log("Firestore error:", err);
  }
}

// ===============================
// LOGIN SUCCESS UI
// ===============================
function successLogin(msg) {
  popup.style.display = "none";
  mainSite.style.display = "block";
  document.body.style.overflow = "auto";
  alert(msg);
}
