// script.js

// FIREBASE CONFIG
// Replace with YOUR firebase config

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXXXXXX",
  appId: "XXXXXXXX"
};

// INIT FIREBASE
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

// SAVE VISITOR
function saveVisitor(){

  const name = document.getElementById("visitorName").value;

  if(name.trim() === ""){
    alert("Please enter your name");
    return;
  }

  // SAVE TO FIRESTORE
  db.collection("visitors").add({
    name:name,
    date:new Date()
  })

  .then(()=>{
    localStorage.setItem("visitorName", name);

    document.getElementById("popup").style.display = "none";

    alert(`Welcome ${name} 👋`);
  })

  .catch((error)=>{
    console.log(error);
  });

}

// CHECK IF ALREADY VISITED
window.onload = ()=>{

  const savedName = localStorage.getItem("visitorName");

  if(savedName){
    document.getElementById("popup").style.display = "none";
  }

}
