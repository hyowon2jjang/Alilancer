import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDFsqb2uS61jj4mAt7Mo2MuDKL3u97ANZM",
  authDomain: "alilancer.firebaseapp.com",
  projectId: "alilancer",
  storageBucket: "alilancer.firebasestorage.app",
  messagingSenderId: "1089373457196",
  appId: "1:1089373457196:web:38a7c7e3ac3af7bfdf7a89",
  measurementId: "G-MZY9WZGNT8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("loginForm");
const messageDiv = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Firestore에서 이메일이 존재하는지 확인
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    messageDiv.textContent = "등록된 사용자가 아닙니다.";
    return;
  }

  // Firebase Auth로 로그인 시도
  signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // 로그인 성공 시 Firestore에서 username 가져오기
      const userDoc = await getDocs(query(usersRef, where("email", "==", email)));
      let username = "";
      userDoc.forEach((doc) => {
        username = doc.data().username;
      });
      // username을 localStorage에 저장
      localStorage.setItem("username", username);

      messageDiv.textContent = "로그인 성공!";
      window.location.href = "main.html";
    })
    .catch((error) => {
      messageDiv.textContent = "이메일 또는 비밀번호가 올바르지 않습니다.";
    });
});