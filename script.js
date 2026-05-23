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
// EMAIL VERIFICATION
// ==========================

function sendEmailLink(){

  const email =
    document.getElementById("email").value;

  const actionCodeSettings = {

    url: "https://mfshacker.github.io/xolii/",

    handleCodeInApp: true
  };

  auth.sendSignInLinkToEmail(
    email,
    actionCodeSettings
  )

  .then(()=>{

    localStorage.setItem(
      "emailForSignIn",
      email
    );

    db.collection("visitors").add({
      method:"email",
      email:email,
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


// ==========================
// PHONE OTP
// ==========================

// RECAPTCHA
window.recaptchaVerifier =
  new firebase.auth.RecaptchaVerifier(
    'recaptcha-container',
    {
      size:'normal'
    }
  );

function sendPhoneOTP(){

  const phoneNumber =
    document.getElementById("phone").value;

  const appVerifier =
    window.recaptchaVerifier;

  auth.signInWithPhoneNumber(
    phoneNumber,
    appVerifier
  )

  .then((confirmationResult)=>{

    window.confirmationResult =
      confirmationResult;

    const code =
      prompt("Enter OTP");

    return confirmationResult.confirm(code);

  })

  .then((result)=>{

    db.collection("visitors").add({

      method:"phone",
      phone:phoneNumber,
      date:new Date()

    });

    document.getElementById(
      "popup"
    ).style.display = "none";

    alert(
      "Phone verified successfully ✅"
    );

  })

  .catch((error)=>{

    console.log(error);

    alert(error.message);

  });

}


// ==========================
// COMPLETE EMAIL LOGIN
// ==========================

window.onload = ()=>{

  if(
    auth.isSignInWithEmailLink(
      window.location.href
    )
  ){

    let email =
      localStorage.getItem(
        "emailForSignIn"
      );

    if(!email){

      email = prompt(
        "Confirm your email"
      );

    }

    auth.signInWithEmailLink(
      email,
      window.location.href
    )

    .then(()=>{

      document.getElementById(
        "popup"
      ).style.display = "none";

      alert(
        "Verified Successfully ✅"
      );

    });

  }

}
