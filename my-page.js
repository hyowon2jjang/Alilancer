import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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
const db = getFirestore(app);

window.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem("username") || "익명";
  document.getElementById("username").textContent = `사용자: ${username}`;

  // location 정보 표시 (localStorage에 저장된 경우)
  const location = localStorage.getItem("location") || "위치 정보 없음";
  document.getElementById("location").textContent = `기본 위치: ${location}`;

  // Firestore에서 내가 등록한 요청만 불러오기
  const myRequestsUl = document.getElementById("myRequests");
  myRequestsUl.innerHTML = "불러오는 중...";

  try {
    const q = query(
      collection(db, "requests"),
      where("username", "==", username),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    myRequestsUl.innerHTML = "";
    if (snapshot.empty) {
      myRequestsUl.innerHTML = "<li>등록한 요청이 없습니다.</li>";
    } else {
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${data.title}</strong> (${data.payment}원)<br>
          ${data.explanation}<br>
          <span style="color:gray;font-size:0.9em;">${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : ''}</span>
        `;
        myRequestsUl.appendChild(li);
      });
    }
  } catch (e) {
    myRequestsUl.innerHTML = `<li>불러오기 실패: ${e.message}</li>`;
  }
});