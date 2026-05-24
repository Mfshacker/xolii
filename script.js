import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ================= FIREBASE =================
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

// ================= UI =================
const btn = document.getElementById("continueBtn");
const input = document.getElementById("userInput");
const popup = document.getElementById("popup");
const mainSite = document.getElementById("main-site");

// loader
window.addEventListener("load", () => {
  document.querySelector(".loader").style.display = "none";
  document.body.style.overflow = "hidden";
});

// button fix
btn.addEventListener("click", handleAuth);

// ================= MAIN =================
async function handleAuth() {
  const value = input.value.trim();

  if (!value) return alert("Enter email or phone");

  await setPersistence(auth, browserLocalPersistence);

  // ================= EMAIL FLOW =================
  if (value.includes("@")) {
    const password = "defaultPassword123";

    try {
      let userCredential;

      try {
        userCredential = await signInWithEmailAndPassword(auth, value, password);
      } catch {
        userCredential = await createUserWithEmailAndPassword(auth, value, password);
        await sendEmailVerification(userCredential.user);
        alert("📩 Verification email sent. Check inbox.");
        return;
      }

      // already exists → check verification
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        alert("⚠️ Please verify your email first. Email sent again.");
        return;
      }

      await logVisitor("email", value);
      success("Welcome 👋");

    } catch (err) {
      alert(err.message);
    }
  }

  // ================= PHONE FLOW =================
  else {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          { size: "invisible" }
        );
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        value,
        window.recaptchaVerifier
      );

      const code = prompt("Enter OTP");

      if (!code) return alert("OTP required");

      await confirmation.confirm(code);

      await logVisitor("phone", value);
      success("Phone verified ✅");

    } catch (err) {
      alert(err.message);

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    }
  }
}

// ================= FIRESTORE =================
async function logVisitor(type, value) {
  try {
    await addDoc(collection(db, "visitors"), {
      type,
      value,
      time: Date.now()
    });
  } catch (e) {
    console.log(e);
  }
}

// ================= SUCCESS UI =================
function success(msg) {
  popup.style.display = "none";
  mainSite.style.display = "block";
  document.body.style.overflow = "auto";
  alert(msg);
}
