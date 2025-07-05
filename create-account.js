import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFsqb2uS61jj4mAt7Mo2MuDKL3u97ANZM",
  authDomain: "alilancer.firebaseapp.com",
  projectId: "alilancer",
  storageBucket: "alilancer.firebasestorage.app",
  messagingSenderId: "1089373457196",
  appId: "1:1089373457196:web:38a7c7e3ac3af7bfdf7a89",
  measurementId: "G-MZY9WZGNT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


const submit = document.getElementById("submit");

submit.addEventListener("click", (e) => {
  e.preventDefault();
  // input fields
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Add a new document in collection "users"
      setDoc(doc(db, "users", userCredential.user.uid), {
        username: username,
        email: email
      })
      .then(() => {
        console.log("User document created successfully");
        window.location.href = "login.html"; // Redirect to login page
      });
    })
    .catch((error) => {
      const errorCode = error.code;      
      const errorMessage = error.message;
      console.error("Error creating user:", errorCode, errorMessage);
      // Handle errors here, e.g., show an error message to the user
    });
});