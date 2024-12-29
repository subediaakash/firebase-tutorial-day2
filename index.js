import dotenv from "dotenv";
dotenv.config();
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};


const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Authentication Elements
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Todo Elements
const authSection = document.getElementById("authSection");
const todoSection = document.getElementById("todoSection");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoTitle = document.getElementById("todoTitle");
const todoDesc = document.getElementById("todoDesc");
const todoList = document.getElementById("todoList");
const noTodosMessage = document.getElementById("noTodosMessage");

// Authentication Functions
registerBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    alert("Registration successful");
  } catch (error) {
    alert(error.message);
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("Login successful");
    toggleAuthState(true);
    loadTodos();
  } catch (error) {
    alert(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await auth.signOut();
    alert("Logged out successfully");
    toggleAuthState(false);
    todoList.innerHTML = "";
  } catch (error) {
    alert(error.message);
  }
});

function toggleAuthState(isLoggedIn) {
  authSection.classList.toggle("hidden", isLoggedIn);
  todoSection.classList.toggle("hidden", !isLoggedIn);
}

// Todo Functions
addTodoBtn.addEventListener("click", async () => {
  const title = todoTitle.value;
  const description = todoDesc.value;

  if (!title.trim()) {
    alert("Please provide a title for the todo");
    return;
  }

  try {
    const docRef = await db.collection("todos").add({
      title,
      description,
      completed: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    alert("Todo added successfully!");
    appendTodoToDOM({
      id: docRef.id,
      title,
      description,
      completed: false,
    });
    todoTitle.value = "";
    todoDesc.value = "";
  } catch (error) {
    alert(error.message);
  }
});

function loadTodos() {
  db.collection("todos")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      todoList.innerHTML = "";
      if (snapshot.empty) {
        noTodosMessage.classList.remove("hidden");
      } else {
        noTodosMessage.classList.add("hidden");
        snapshot.forEach((doc) => {
          appendTodoToDOM({ id: doc.id, ...doc.data() });
        });
      }
    });
}

function appendTodoToDOM(todo) {
  const todoDiv = document.createElement("div");
  todoDiv.className = `todo ${todo.completed ? "completed" : ""}`;
  todoDiv.innerHTML = `
    <div>
      <h3>${todo.title}</h3>
      <p>${todo.description}</p>
    </div>
    <div>
      <button class="btn" onclick="toggleComplete('${todo.id}', ${
    todo.completed
  })">${todo.completed ? "Unmark" : "Complete"}</button>
      <button class="btn danger" onclick="deleteTodo('${
        todo.id
      }')">Delete</button>
    </div>
  `;
  todoList.appendChild(todoDiv);
}

async function deleteTodo(id) {
  try {
    await db.collection("todos").doc(id).delete();
    alert("Todo deleted successfully");
  } catch (error) {
    alert(error.message);
  }
}

async function toggleComplete(id, currentState) {
  try {
    await db.collection("todos").doc(id).update({
      completed: !currentState,
    });
  } catch (error) {
    alert(error.message);
  }
}
