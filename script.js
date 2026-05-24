// FIREBASE CONFIG

const firebaseConfig = {

  apiKey: "AIzaSyD91XfKDdN4e9HXTEUlMZgVykG3ITAQ8NM",
  authDomain: "xolii-web.firebaseapp.com",
  projectId: "xolii-web",
  storageBucket: "xolii-web.firebasestorage.app",
  messagingSenderId: "478461534020",
  appId: "1:478461534020:web:267db318833ac2fdc68111",
  measurementId: "G-H53L21CFXJ"

};


// INIT FIREBASE

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


// ==========================
// MAIN AUTH FUNCTION
// ==========================

function continueAuth() {

  const input =
    document.getElementById(
      "userInput"
    ).value.trim();

  // EMPTY INPUT

  if (!input) {

    alert(
      "Enter Gmail or Phone number"
    );

    return;
  }


  // ==========================
  // EMAIL FLOW
  // ==========================

  if (input.includes("@")) {

    const actionCodeSettings = {

      url: "https://mfshacker.github.io/xolii/",

      handleCodeInApp: true

    };


    auth.setPersistence(
      firebase.auth.Auth.Persistence.LOCAL
    );


    auth.sendSignInLinkToEmail(
      input,
      actionCodeSettings
    )

    .then(() => {

      window.localStorage.setItem(
        "emailForSignIn",
        input
      );

      // SAVE VISITOR

      db.collection("visitors").add({

        method: "email",
        email: input,
        date: new Date()

      });

      alert(
        "Verification link sent 📩 Check your email"
      );

    })

    .catch((error) => {

      console.log(error);

      alert(error.message);

    });

  }


  // ==========================
  // PHONE FLOW
  // ==========================

  else {

    const appVerifier =
      window.recaptchaVerifier;

    auth.signInWithPhoneNumber(
      input,
      appVerifier
    )

    .then((confirmationResult) => {

      const code = prompt(
        "Enter OTP sent to your phone"
      );

      if (!code) {

        alert("OTP required");

        return;
      }

      return confirmationResult.confirm(
        code
      );

    })

    .then(() => {

      // SAVE VISITOR

      db.collection("visitors").add({

        method: "phone",
        phone: input,
        date: new Date()

      });

      // SHOW WEBSITE

      document.getElementById(
        "popup"
      ).style.display = "none";

      document.getElementById(
        "main-site"
      ).style.display = "block";

      document.body.style.overflow =
        "auto";

      alert(
        "Phone verified successfully ✅"
      );

    })

    .catch((error) => {

      console.log(error);

      alert(error.message);

    });

  }

}


// ==========================
// PAGE LOAD
// ==========================

window.onload = () => {

  // LOCK SCROLL BEFORE LOGIN

  document.querySelector(".loader").style.display = "none";
  
  document.body.style.overflow =
    "hidden";


  // INIT RECAPTCHA

  window.recaptchaVerifier =
    new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible'
      }
    );


  // ==========================
  // EMAIL LOGIN HANDLER
  // ==========================

  if (
    auth.isSignInWithEmailLink(
      window.location.href
    )
  ) {

    let email =
      window.localStorage.getItem(
        "emailForSignIn"
      );

    if (!email) {

      email = prompt(
        "Confirm your email again:"
      );

    }


    auth.signInWithEmailLink(
      email,
      window.location.href
    )

    .then(() => {

      // HIDE POPUP

      document.getElementById(
        "popup"
      ).style.display = "none";

      // SHOW WEBSITE

      document.getElementById(
        "main-site"
      ).style.display = "block";

      // ENABLE SCROLL

      document.body.style.overflow =
        "auto";

      alert(
        "Email verified successfully ✅"
      );

    })

    .catch((error) => {

      console.log(error);

      alert(error.message);

    });

  }

};
