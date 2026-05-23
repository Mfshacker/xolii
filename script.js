// script.js

// FIREBASE CONFIG
// Replace with YOUR firebase config

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
