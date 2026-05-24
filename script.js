// FIREBASE CONFIG
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signInWithEmailLink,
  isSignInWithEmailLink,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

// Set language code like in screenshot 4
auth.languageCode = 'en'; // or auth.useDeviceLanguage();

// MAIN AUTH FUNCTION
async function continueAuth() {
  const input = document.getElementById("userInput").value.trim();

  if (!input) {
    alert("Enter Gmail or Phone number");
    return;
  }

  await setPersistence(auth, browserLocalPersistence);

  // EMAIL FLOW
  if (input.includes("@")) {
    const actionCodeSettings = {
      url: "https://mfshacker.github.io/xolii/",
      handleCodeInApp: true
    };

    try {
      await sendSignInLinkToEmail(auth, input, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", input);

      await addDoc(collection(db, "visitors"), {
        method: "email",
        email: input,
        date: new Date()
      });

      alert("Verification link sent 📩 Check your email");
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  } 
  
  // PHONE FLOW
  else {
    // Invisible reCAPTCHA from screenshot 4
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again
        }
      });
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, input, window.recaptchaVerifier);
      
      const code = prompt("Enter OTP sent to your phone");
      if (!code) {
        alert("OTP required");
        return;
      }

      await confirmationResult.confirm(code);

      await addDoc(collection(db, "visitors"), {
        method: "phone",
        phone: input,
        date: new Date()
      });

      document.getElementById("popup").style.display = "none";
      document.getElementById("main-site").style.display = "block";
      document.body.style.overflow = "auto";
      alert("Phone verified successfully ✅");

    } catch (error) {
      console.log(error);
      alert(error.message);
      // Reset reCAPTCHA on error like screenshot 5 suggests
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          grecaptcha.reset(widgetId);
        });
      }
    }
  }
}

// PAGE LOAD
window.onload = () => {
  document.querySelector(".loader").style.display = "none";
  document.body.style.overflow = "hidden";

  // Handle email link sign-in
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem("emailForSignIn");
    if (!email) {
      email = prompt("Confirm your email again:");
    }

    signInWithEmailLink(auth, email, window.location.href)
      .then(() => {
        document.getElementById("popup").style.display = "none";
        document.getElementById("main-site").style.display = "block";
        document.body.style.overflow = "auto";
        alert("Email verified successfully ✅");
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  }
};
