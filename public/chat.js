import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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

const email = localStorage.getItem("email");
const username = localStorage.getItem("username");
if (!email || !username) {
  alert("로그인 후 이용 가능합니다.");
  window.location.href = "login.html";
}

const chatListElem = document.getElementById("chatList");
const messagesElem = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatWithElem = document.getElementById("chatWith");
const goMainBtn = document.getElementById("goMainBtn");
const userSelect = document.getElementById("userSelect");
const startChatBtn = document.getElementById("startChatBtn");

goMainBtn.onclick = () => window.location.href = "index.html";

let currentChatUser = null;
let currentChatId = null;
let unsubscribe = null;

// 1. 내가 대화한 사용자 목록 불러오기
async function loadChatUsers() {
  chatListElem.innerHTML = "<li>불러오는 중...</li>";
  // 내가 보낸 메시지와 받은 메시지 모두 조회
  const q = query(
    collection(db, "messages"),
    where("sender", "==", username)
  );
  const r = query(
    collection(db, "messages"),
    where("receiver", "==", username)
  );
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

// 전체 사용자 목록 불러오기 (예시: users 컬렉션에서)
async function loadAllUsers() {
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

// 2. 채팅방 ID 생성 (두 사용자 이름을 정렬해서 조합)
function getChatId(userA, userB) {
  return [userA, userB].sort().join("_");
}

// 3. 채팅방 열기 및 메시지 실시간 표시
function openChat(otherUser) {
  currentChatUser = otherUser;
  currentChatId = getChatId(username, otherUser);
  chatWithElem.textContent = `상대: ${otherUser}`;
  messagesElem.innerHTML = "불러오는 중...";

  // 기존 리스너 해제
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

// 4. 메시지 전송
sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (!text || !currentChatUser) return;
  await addDoc(collection(db, "messages"), {
    chatId: currentChatId,
    sender: username,
    receiver: currentChatUser,
    text,
    timestamp: serverTimestamp()
  });
  messageInput.value = "";
  openChat(currentChatUser); // 메시지 전송 후
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
    // 목록 새로고침 및 하이라이트
    Array.from(chatListElem.children).forEach(li => {
      if (newUsers.has(li.textContent)) {
        li.style.color = "red";
      }
    });
    // 새 메시지가 오면 채팅 상대 목록 자동 새로고침
    loadChatUsers();
    openChat(currentChatUser); 
  });
}

// 최초 사용자 목록 및 전체 사용자 목록 불러오기
loadChatUsers();
loadAllUsers();
watchChatUsers();