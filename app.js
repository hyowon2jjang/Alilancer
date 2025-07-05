// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDFsqb2uS61jj4mAt7Mo2MuDKL3u97ANZM",
//   authDomain: "alilancer.firebaseapp.com",
//   projectId: "alilancer",
//   storageBucket: "alilancer.firebasestorage.app",
//   messagingSenderId: "1089373457196",
//   appId: "1:1089373457196:web:38a7c7e3ac3af7bfdf7a89",
//   measurementId: "G-MZY9WZGNT8"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const auth = getAuth(app);

// export function login(email, password) {
//   return signInWithEmailAndPassword(auth, email, password);
// }

// export function register(email, password) {
//   return createUserWithEmailAndPassword(auth, email, password);
// }

// export function logout() {
//   return signOut(auth);
// }

// // 로그인/회원가입/로그아웃 UI 처리
// function updateUserUI(user) {
//   const userIdDiv = document.getElementById("user-id");
//   const statusDiv = document.getElementById("login-status");
//   if (user) {
//     userIdDiv.textContent = user.email;
//     userIdDiv.style.display = "block";
//     if (statusDiv) statusDiv.textContent = "로그인 상태입니다.";
//   } else {
//     userIdDiv.textContent = "";
//     userIdDiv.style.display = "none";
//     if (statusDiv) statusDiv.textContent = "로그아웃 상태입니다.";
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   // 로그인
//   const loginForm = document.getElementById("login-form");
//   if (loginForm) {
//     loginForm.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const email = document.getElementById("email").value;
//       const password = document.getElementById("password").value;
//       try {
//         await login(email, password);
//         document.getElementById("login-result").textContent = "로그인 성공!";
//       } catch (error) {
//         document.getElementById("login-result").textContent = "로그인 실패: " + error.message;
//       }
//     });
//   }

//   // 회원가입
//   const registerForm = document.getElementById("register-form");
//   if (registerForm) {
//     registerForm.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const email = document.getElementById("register-email").value;
//       const password = document.getElementById("register-password").value;
//       try {
//         await register(email, password);
//         document.getElementById("register-result").textContent = "회원가입 성공!";
//       } catch (error) {
//         document.getElementById("register-result").textContent = "회원가입 실패: " + error.message;
//       }
//     });
//   }

//   // 로그아웃
//   const logoutBtn = document.getElementById("logout-btn");
//   if (logoutBtn) {
//     logoutBtn.addEventListener("click", async () => {
//       await logout();
//     });
//   }

//   // 로그인 상태 변화 감지
//   onAuthStateChanged(auth, (user) => {
//     updateUserUI(user);
//   });
// });