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
// INIT
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


// ==========================
// COMBINED AUTH SYSTEM
// ==========================

window.recaptchaVerifier =
  new firebase.auth.RecaptchaVerifier(
    'recaptcha-container',
    {
      size:'invisible'
    }
  );

function continueAuth(){

  const input =
    document.getElementById(
      "userInput"
    ).value.trim();

  // CHECK IF EMAIL
  if(input.includes("@")){

    const actionCodeSettings = {

      url:"https://mfshacker.github.io/xolii/",

      handleCodeInApp:true
    };

    auth.sendSignInLinkToEmail(
      input,
      actionCodeSettings
    )

    .then(()=>{

      localStorage.setItem(
        "emailForSignIn",
        input
      );

      db.collection("visitors").add({

        method:"email",
        email:input,
        date:new Date()

      });

      alert(
        "Verification link sent 📩"
      );

    })

    .catch((error)=>{

      alert(error.message);

    });

  }

  // OTHERWISE PHONE
  else{

    const appVerifier =
      window.recaptchaVerifier;

    auth.signInWithPhoneNumber(
      input,
      appVerifier
    )

    .then((confirmationResult)=>{

      const code =
        prompt("Enter OTP");

      return confirmationResult.confirm(
        code
      );

    })

    .then(()=>{

      db.collection("visitors").add({

        method:"phone",
        phone:input,
        date:new Date()

      });

      document.getElementById(
        "popup"
      ).style.display = "none";

      alert(
        "Phone verified ✅"
      );

    })

    .catch((error)=>{

      alert(error.message);

    });

  }

}
