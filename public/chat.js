import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
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

const chatListElem = document.getElementById("chatList");
const messagesElem = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatWithElem = document.getElementById("chatWith");
const goMainBtn = document.getElementById("goMainBtn");
const userSelect = document.getElementById("userSelect");
const startChatBtn = document.getElementById("startChatBtn");

goMainBtn.onclick = () => window.location.href = "index.html";

let username = null;
let currentChatUser = null;
let currentChatId = null;
let unsubscribe = null;

// 쿼리스트링 파싱 함수
function getQueryParams() {
  const params = {};
  window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str,key,value) {
    params[key] = decodeURIComponent(value);
  });
  return params;
}

const params = getQueryParams();
let forcedChatId = params.chatId;
let forcedRequestId = params.requestId;
let forcedOtherUser = params.otherUser;

// 인증 상태 감지 및 Firestore에서 username 조회
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("로그인 후 이용 가능합니다.");
    window.location.href = "login.html";
    return;
  }
  // Firestore에서 username 조회
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("uid", "==", user.uid));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    alert("사용자 정보를 찾을 수 없습니다.");
    window.location.href = "login.html";
    return;
  }
  username = snapshot.docs[0].data().username;

  // 채팅 기능 초기화
  loadChatUsers();
  loadAllUsers();
  watchChatUsers();

  // 요청 데이터 표시
  if (forcedRequestId) {
    const reqDoc = await getDoc(doc(db, "requests", forcedRequestId));
    if (reqDoc.exists()) {
      const data = reqDoc.data();
      // chat.html에 요청 정보 표시 (예시)
      const reqDiv = document.createElement("div");
      reqDiv.className = "request-info";
      reqDiv.innerHTML = `
        <h4>요청 정보</h4>
        <div><b>제목:</b> ${data.title}</div>
        <div><b>설명:</b> ${data.explanation}</div>
        <div><b>조건:</b> ${data.conditions.join(", ")}</div>
        <div><b>위치:</b> ${data.location}</div>
        <div><b>결제:</b> ${data.payment}원</div>
        <div><b>상태:</b> ${data.status}</div>
      `;
      document.body.insertBefore(reqDiv, document.getElementById("messages"));
    }
  }

  // 자동 채팅방 오픈
  if (forcedChatId) {
    const usersSet = new Set();
    const r = query(collection(db, "messages"), where("receiver", "==", username));
    const receivedSnapshot = await getDocs(r);
    receivedSnapshot.forEach(doc => usersSet.add(doc.data().sender));
    usersSet.delete(username);

    if (usersSet.size === 1) {
      const otherUser = Array.from(usersSet)[0];
      openChat(otherUser);
    }
  }
});

// 1. 내가 대화한 사용자 목록 불러오기
async function loadChatUsers() {
  if (!username) return;
  chatListElem.innerHTML = "<li>불러오는 중...</li>";
  const q = query(collection(db, "messages"), where("sender", "==", username));
  const r = query(collection(db, "messages"), where("receiver", "==", username));
  const sentSnapshot = await getDocs(q);
  const receivedSnapshot = await getDocs(r);

  const usersSet = new Set();
  sentSnapshot.forEach(doc => usersSet.add(doc.data().receiver));
  receivedSnapshot.forEach(doc => usersSet.add(doc.data().sender));
  usersSet.delete(username);

  chatListElem.innerHTML = "";
  if (usersSet.size === 0) {
    chatListElem.innerHTML = "<li>대화한 사용자가 없습니다.</li>";
    return;
  }
  usersSet.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    li.className = "chat-user";
    li.onclick = () => openChat(user);
    chatListElem.appendChild(li);
  });
}

// 전체 사용자 목록 불러오기
async function loadAllUsers() {
  if (!username) return;
  userSelect.innerHTML = "";
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.username !== username) {
      const option = document.createElement("option");
      option.value = data.username;
      option.textContent = data.username;
      userSelect.appendChild(option);
    }
  });
}

// 채팅방 ID 생성
function getChatId(userA, userB) {
  return [userA, userB].sort().join("_");
}

// 채팅방 열기 및 메시지 실시간 표시
function openChat(otherUser) {
  if (!username) return;
  currentChatUser = otherUser;
  currentChatId = getChatId(username, otherUser);
  chatWithElem.textContent = `상대: ${otherUser}`;
  messagesElem.innerHTML = "불러오는 중...";

  if (unsubscribe) unsubscribe();

  const q = query(
    collection(db, "messages"),
    where("chatId", "==", currentChatId),
    orderBy("timestamp", "asc")
  );
  unsubscribe = onSnapshot(q, (snapshot) => {
    messagesElem.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const msgDiv = document.createElement("div");
      msgDiv.className = "message";
      msgDiv.innerHTML = `
        <span class="sender">${data.sender}</span>: 
        <span>${data.text}</span>
        <span class="timestamp">${data.timestamp?.toDate().toLocaleString() || ""}</span>
      `;
      messagesElem.appendChild(msgDiv);
    });
    messagesElem.scrollTop = messagesElem.scrollHeight;
  });

  Array.from(chatListElem.children).forEach(li => {
    if (li.textContent === otherUser) li.style.color = "blue";
    else li.style.color = "";
  });
}

// 새 채팅 시작 버튼 클릭 시
startChatBtn.onclick = () => {
  const selectedUser = userSelect.value;
  if (selectedUser) {
    openChat(selectedUser);
  }
};

// 메시지 전송
sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text || !currentChatUser || !username) return;
  await addDoc(collection(db, "messages"), {
    chatId: currentChatId,
    sender: username,
    receiver: currentChatUser,
    text,
    timestamp: serverTimestamp()
  });
  messageInput.value = "";
  openChat(currentChatUser);
};

// Enter 키로 메시지 전송
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const text = messageInput.value.trim();
    if (text) {
      sendBtn.click();
    }
  }
});

// 채팅 상대 목록 실시간 감시 및 하이라이트
function watchChatUsers() {
  if (!username) return;
  const q = query(
    collection(db, "messages"),
    where("receiver", "==", username)
  );
  onSnapshot(q, (snapshot) => {
    const newUsers = new Set();
    snapshot.docChanges().forEach(change => {
      if (change.type === "added") {
        const sender = change.doc.data().sender;
        if (sender !== username) newUsers.add(sender);
      }
    });
    Array.from(chatListElem.children).forEach(li => {
      if (newUsers.has(li.textContent)) {
        li.style.color = "red";
      }
    });
    loadChatUsers();
    openChat(currentChatUser); 
  });
}