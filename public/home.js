import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, addDoc, onSnapshot, orderBy, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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

window.addEventListener('DOMContentLoaded', () => {
  const welcomeElement = document.getElementById("welcome");
  const logoutBtn = document.getElementById("logoutBtn");
  const myPageBtn = document.getElementById("myPageBtn");
  const chatBtn = document.getElementById("chatBtn");
  let currentUsername = null; // 인증된 사용자의 username 저장

  // 인증 상태 감지 및 사용자 정보 표시
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Firestore에서 username 조회
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        currentUsername = snapshot.docs[0].data().username;
        if (welcomeElement) welcomeElement.textContent = `환영합니다, ${currentUsername}님!`;
      } else {
        currentUsername = "알 수 없음";
        if (welcomeElement) welcomeElement.textContent = "환영합니다!";
      }
      // 버튼 표시
      if (logoutBtn) logoutBtn.style.display = "inline-block";
      if (myPageBtn) myPageBtn.style.display = "inline-block";
      if (loginBtn) loginBtn.style.display = "none";
    } else {
      currentUsername = null;
      if (welcomeElement) welcomeElement.textContent = "환영합니다! 로그인해주세요.";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (myPageBtn) myPageBtn.style.display = "none";
      if (loginBtn) loginBtn.style.display = "inline-block";
    }
  });

  // 로그인 버튼 생성 및 삽입 (기존 코드 유지)
  let loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) {
    loginBtn = document.createElement("button");
    loginBtn.id = "loginBtn";
    loginBtn.textContent = "로그인";
    loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.parentNode.insertBefore(loginBtn, logoutBtn);
  }
  loginBtn.addEventListener("click", function() {
    window.location.href = "login.html";
  });

  // 로그아웃 버튼
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      }).catch((error) => {
        alert("로그아웃 중 오류가 발생했습니다.");
      });
    });
  }

  // myPageBtn, chatBtn 클릭 이벤트 (기존 코드 유지)
  if (myPageBtn) myPageBtn.addEventListener("click", function() {
    window.location.href = "my-page.html";
  });
  if (chatBtn) chatBtn.addEventListener("click", function() {
    window.location.href = "chat.html";
  });

  // 조건 선택 기능
  let selectedConditions = [];
  const selectedConditionsSpan = document.getElementById('selectedConditions');
  document.querySelectorAll('.condition-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const cond = btn.textContent;
      if (!selectedConditions.includes(cond)) {
        selectedConditions.push(cond);
        btn.style.backgroundColor = "#b2dfdb";
      } else {
        selectedConditions = selectedConditions.filter(c => c !== cond);
        btn.style.backgroundColor = "";
      }
      if (selectedConditionsSpan) {
        selectedConditionsSpan.textContent = selectedConditions.join(', ');
      }
    });
  });

// Request 버튼 클릭 시 Firestore에 저장
const addRequestBtn = document.getElementById('addRequestBtn');
if (addRequestBtn) { // Check if element exists
  addRequestBtn.addEventListener('click', async function(e) {
    e.preventDefault();

    const titleInput = document.getElementById('title');
    const explanationInput = document.getElementById('explanation');
    const paymentInput = document.getElementById('payment');
    const locationInput = document.getElementById('location');

    if (!titleInput || !explanationInput || !paymentInput) {
      alert('페이지 요소가 로드되지 않았습니다. 새로고침 해주세요.');
      return;
    }

    const title = titleInput.value.trim();
    const explanation = explanationInput.value.trim();
    const payment = Number(paymentInput.value);
    const location = locationInput ? locationInput.value.trim() : "위치 정보 없음"; // 위치 정보 입력 필드가 있는 경우

    if (!title || !explanation || selectedConditions.length === 0 || isNaN(payment) || payment <= 0) {
      alert('모든 항목을 올바르게 입력해주세요 (결제는 0보다 커야 합니다).');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "requests"), {
        location,
        title,
        explanation,
        conditions: selectedConditions,
        payment,
        username: currentUsername || "익명",
        createdAt: new Date(),
        status: "open" // 상태 필드 추가
      });

      await setDoc(doc(db, "requests", docRef.id), { dataId: docRef.id }, { merge: true });
      alert('요청이 등록되었습니다!');
      // 입력값 초기화
      titleInput.value = '';
      explanationInput.value = '';
      paymentInput.value = '';
      selectedConditions = [];
      if (selectedConditionsSpan) {
        selectedConditionsSpan.textContent = '';
      }
      document.querySelectorAll('.condition-btn').forEach(btn => {
        btn.style.backgroundColor = '';
      });
      loadRequests();
    } catch (e) {
      alert('저장 실패: ' + e.message);
      console.error("Error adding document: ", e);
    }
});
}

// Firestore에서 요청 목록 불러오기
  function loadRequests() {
    const ul = document.getElementById('requests');
    if (!ul) { // Check if element exists
      console.error("requests element not found.");
      return;
    }
    ul.innerHTML = ''; // Clear existing list items

    // Order by createdAt in descending order to show newest first
    const q = query(collection(db, "requests"),
              where("username", "!=", currentUsername),
            orderBy("createdAt", "desc"));

    // Set up a real-time listener for changes in the 'requests' collection
    onSnapshot(q, (snapshot) => {
      ul.innerHTML = ''; // Clear the list again to rebuild it
      if (snapshot.empty) {
        const noRequestsLi = document.createElement('li');
        noRequestsLi.className = "md:col-span-3 text-center text-gray-500 py-8";
        noRequestsLi.textContent = "아직 등록된 요청이 없습니다. 첫 번째 요청을 등록해보세요!";
        ul.appendChild(noRequestsLi);
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        li.className = "task-item"; // Apply common styling class
        li.innerHTML = `
          <h3 class="text-xl font-semibold text-blue-800 mb-2">${data.title}</h3>
          <p class="text-gray-700 mb-1">${data.explanation}</p>
          <p class="text-gray-700 mb-1">
            <span class="font-medium">조건:</span> <span class="text-indigo-700">${data.conditions.join(', ')}</span>
          </p>
          <p class="text-gray-500 text-xs mt-2">
            <span class="font-medium">위치:</span> ${data.location || '위치 정보 없음'}
          </p>
          <p class="text-gray-700 mb-1">
            <span class="font-medium">결제:</span> <span class="font-bold text-green-600">${data.payment}원</span>
          </p>
          <p class="text-gray-600 text-sm">
            <span class="font-medium">작성자:</span> ${data.username}
          </p>
          <p class="text-gray-500 text-xs mt-2">
            등록일: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : '날짜 없음'}
          </p>
          <button class="mt-4 w-full btn-primary accept-task-btn" data-id="${doc.id}">
            수락하기
          </button>
        `;
        ul.appendChild(li);
      });

      // Add event listeners to the newly created "Accept Task" buttons
      document.querySelectorAll('.accept-task-btn').forEach(button => {
        button.addEventListener('click', async function() {
          const taskId = this.dataset.id;
          if (!currentUsername) {
            alert("로그인 후 이용 가능합니다.");
            return;
          }
          // 요청 상태를 negotiating으로 변경
          await setDoc(doc(db, "requests", taskId), { status: "negotiating", negotiator: currentUsername }, { merge: true });

          // 요청 데이터 가져오기
          const reqDoc = await getDoc(doc(db, "requests", taskId));
          const requestData = reqDoc.data();
          const requester = requestData.username;

          // 채팅방 ID 생성 (요청자와 수락자)
          const chatId = [requester, currentUsername].sort().join("_");

          // chat.html로 이동 (요청 ID, 채팅방 ID, 상대방 username 전달)
          window.location.href = `chat.html?chatId=${chatId}&requestId=${taskId}&otherUser=${requester}`;
        });
      });
    }, (error) => {
      console.error("Error loading requests:", error);
      const ul = document.getElementById('requests');
      if (ul) {
        ul.innerHTML = `<li class="md:col-span-3 text-center text-red-600 py-8">요청 목록을 불러오는 데 실패했습니다: ${error.message}</li>`;
      }
    });
  }

// 페이지 로드 시 요청 목록 표시
  loadRequests();
});