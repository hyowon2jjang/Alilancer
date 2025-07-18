import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

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
const auth = getAuth(app);

document.getElementById('goMainBtn').onclick = function() {
  window.location.href = "index.html";
};

window.addEventListener('DOMContentLoaded', () => {
  const usernameElem = document.getElementById("username");
  const locationElem = document.getElementById("location");
  const myRequestsUl = document.getElementById("myRequests");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      usernameElem.textContent = "로그인 정보 없음";
      locationElem.textContent = "";
      window.location.href = "login.html";
      return;
    }

    try {
      // Firestore에서 uid로 사용자 정보 조회
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        usernameElem.textContent = "사용자 정보를 찾을 수 없습니다.";
        locationElem.textContent = "";
        myRequestsUl.innerHTML = "<li>등록한 요청이 없습니다.</li>";
        return;
      }

      const userData = snapshot.docs[0].data();
      const username = userData.username || "이름 없음";
      const location = userData.location || "위치 정보 없음";
      const email = userData.email || user.email;

      usernameElem.textContent = `사용자: ${username}`;
      locationElem.textContent = `기본 위치: ${location} / 이메일: ${email}`;

      // Firestore에서 내가 등록한 요청만 불러오기
      myRequestsUl.innerHTML = "불러오는 중...";
      const rq = query(
        collection(db, "requests"),
        where("username", "==", username),
        orderBy("createdAt", "desc")
      );
      const reqSnapshot = await getDocs(rq);

      myRequestsUl.innerHTML = "";
      if (reqSnapshot.empty) {
        myRequestsUl.innerHTML = "<li>등록한 요청이 없습니다.</li>";
      } else {
        reqSnapshot.forEach(doc => {
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
      usernameElem.textContent = "사용자 정보 불러오기 실패";
      locationElem.textContent = "";
      myRequestsUl.innerHTML = `<li>불러오기 실패: ${e.message}</li>`;
    }
  });
});