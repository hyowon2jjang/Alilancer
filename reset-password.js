import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

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

const resetForm = document.getElementById("resetForm");
const messageDiv = document.getElementById("message");

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;

  try {
    await sendPasswordResetEmail(auth, email);
    messageDiv.textContent = "비밀번호 재설정 이메일이 전송되었습니다.";
  } catch (error) {
    messageDiv.textContent = "이메일 전송에 실패했습니다. 이메일 주소를 확인하세요.";
  }
});