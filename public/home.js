import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, addDoc, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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
  // localStorage에서 username을 읽어와 표시
  const username = localStorage.getItem("username");
  const welcomeElement = document.getElementById("welcome");
  if (welcomeElement && username) {
    welcomeElement.textContent = `환영합니다, ${username}님!`;
  } else if (welcomeElement) {
    welcomeElement.textContent = "환영합니다! 로그인해주세요.";
  }

  // 버튼 요소 가져오기
  const logoutBtn = document.getElementById("logoutBtn");
  const myPageBtn = document.getElementById("myPageBtn");
  const chatBtn = document.getElementById("chatBtn");

  // 로그인 버튼 생성 및 삽입
  let loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) {
    loginBtn = document.createElement("button");
    loginBtn.id = "loginBtn";
    loginBtn.textContent = "로그인";
    loginBtn.style.display = "none";
    // logoutBtn 앞에 삽입
    if (logoutBtn) logoutBtn.parentNode.insertBefore(loginBtn, logoutBtn);
  }

  // 로그인 상태에 따라 버튼 표시
  if (username) {
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (myPageBtn) myPageBtn.style.display = "inline-block";
    loginBtn.style.display = "none";
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
    if (myPageBtn) myPageBtn.style.display = "none";
    loginBtn.style.display = "inline-block";
  }

  // 로그인 버튼 클릭 시 로그인 페이지로 이동
  loginBtn.addEventListener("click", function() {
    window.location.href = "login.html";
  });

  // 로그아웃 버튼 클릭 시 username 삭제 및 로그인 페이지로 이동
  if (logoutBtn) { // Check if element exists
    logoutBtn.addEventListener("click", function() {
      localStorage.removeItem("username");
      // In a real app, you'd also sign out from Firebase Auth here:
      signOut(auth).then(() => {
        window.location.href = "login.html";
      }).catch((error) => {
        console.error("Error signing out:", error);
        alert("로그아웃 중 오류가 발생했습니다.");
      });
      window.location.href = "login.html"; // Redirect after local logout
    });
  }

  if (myPageBtn) { // Check if element exists
    myPageBtn.addEventListener("click", function() {
      window.location.href = "my-page.html"; // Redirect to my-page.html
    });
  }

  if (chatBtn) { // Check if element exists
    chatBtn.addEventListener("click", function() {
      window.location.href = "chat.html"; // Redirect to my-page.html
    });
  }



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
      await addDoc(collection(db, "requests"), {
        location,
        title,
        explanation,
        conditions: selectedConditions,
        payment,
        username: username || "익명",
        createdAt: new Date()
      });
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
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));

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
        button.addEventListener('click', function() {
          const taskId = this.dataset.id;
          alert(`Task ID ${taskId} 수락 로직 구현 필요!`);
          // Here you would implement logic to update the task status in Firestore,
          // assign it to the current user, etc.
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