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

// localStorage에서 username을 읽어와 표시
const username = localStorage.getItem("username");
if (username) {
document.getElementById("welcome").textContent = `환영합니다, ${username}님!`;
}

// 로그아웃 버튼 클릭 시 username 삭제 및 로그인 페이지로 이동
document.getElementById("logoutBtn").addEventListener("click", function() {
localStorage.removeItem("username");
window.location.href = "login.html";
});