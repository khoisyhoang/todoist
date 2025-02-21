
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC-xVKifDogT-ZPdBJZFsXognklDYEEF3U",
  authDomain: "todoist-a6da6.firebaseapp.com",
  databaseURL: "https://todoist-a6da6-default-rtdb.firebaseio.com",
  projectId: "todoist-a6da6",
  storageBucket: "todoist-a6da6.firebasestorage.app",
  messagingSenderId: "14304658904",
  appId: "1:14304658904:web:bf193f5bc82e42d3ad1ead"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Add Tasks
const formCreate = document.querySelector("[form-create]");
formCreate.addEventListener("submit", (event) => {
  event.preventDefault();
  let content = event.currentTarget.content.value;
  if (content) {
    const todoRef = ref(database, 'todo');
    const newTodoRef = push(todoRef);
    set(newTodoRef, {
      content: content,
      completed: false
    })
    event.currentTarget.content.value = "";
  }
})
// Get tasks per page
const url = new URL(location.href);
const tasksPerPage = 4;
let currentPage = 1;
if (url.searchParams.get("page")){
  currentPage = url.searchParams.get("page");
}

const startItem = (currentPage-1)*tasksPerPage + 1;
const endItem = startItem + tasksPerPage -1;

// Get all tasks
onValue(ref(database, 'todo'), item => {
  let displayTasks = ``;
  const totalItem = item.size;
  const pages = Math.ceil(totalItem/tasksPerPage);
  // pagination
  const pagination = document.querySelector("[pagination]");
  let htmlPage = "";
  for (let i = 1; i <= pages; i++){
    htmlPage += `
      <option value="${i}">Page ${i}</option>
    `
  }
  pagination.innerHTML = htmlPage;
  pagination.value = currentPage;
  // End pagination
  let count = 0;

  item.forEach((element, index) => {
    count++;
    if (count >= startItem && count <= endItem){
      
      let button = ``
      if (!element.val().completed){
        button = `
          <button class="todo-app__item-button todo-app__item-button--complete" button-complete item-key="${element.key}">
            <i class="fa-solid fa-check"></i>
          </button>
        `
      }
      else {
        button = `
          <button class="todo-app__item-button todo-app__item-button--undo" button-undo item-key="${element.key}">
            <i class="fa-solid fa-undo"></i>
          </button>
        `
      }
      displayTasks += `
        <div class="todo-app__item ${element.val().completed ? "todo-app__item--completed" : ""}">
          <span class="todo-app__item-content"">${element.val().content}</span>
          <div class="todo-app__item-actions">
              <button class="todo-app__item-button todo-app__item-button--edit" 
              button-edit 
              item-key="${element.key}"
              >
                  <i class="fa-solid fa-pen-to-square"></i>
              </button>
              ${button}
              <button class="todo-app__item-button todo-app__item-button--delete" button-remove item-key="${element.key}">
                  <i class="fa-solid fa-trash"></i>
              </button>
          </div>
        </div>
  
      `
    }
    
  });
  const todoList = document.querySelector("[todo-list]");
  todoList.innerHTML = displayTasks;

  // Update Complete tasks
  const listButtonComplete = document.querySelectorAll("[button-complete]");
  listButtonComplete.forEach(button => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("item-key");
      update(ref(database, `todo/${key}`), {
        completed: true
      });
    })
  })
  // Delete Completed tasks
  const listButtonRemove = document.querySelectorAll("[button-remove]");
  listButtonRemove.forEach(button => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("item-key");
      remove(ref(database, `todo/${key}`));
    })
  })

  // Undo tasks
  const listButtonUndo = document.querySelectorAll("[button-undo]");
  listButtonUndo.forEach(button => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("item-key");
      update(ref(database, `todo/${key}`), {
        completed: false
      });
    })
  })

  // Edit tasks
  const listButtonEdit = document.querySelectorAll("[button-edit]");
  listButtonEdit.forEach(button => {
    button.addEventListener("click", () => {
      const key = button.getAttribute("item-key");
      const modalEdit = document.querySelector("[modal-edit]");
      modalEdit.classList.add("show");
      onValue(ref(database, `todo/${key}`), item => {
        const value = item.val();
        const input = modalEdit.querySelector(`input[name="content"]`);
        input.value = value.content;
        const form = modalEdit.querySelector("form");
        form.setAttribute("key", key);

        const setCompleted = modalEdit.querySelector('select[name="completed"');
        setCompleted.value = value.completed ? "1" : "0";
      })
    })
  })
})


const popUp = document.querySelector("[modal-edit]");
if (popUp){
  // Close pop up
  const buttonClose = popUp.querySelector(".inner-close");
  buttonClose.addEventListener("click", () => {
    popUp.classList.remove("show");
  })
  // Submit form
  const form = popUp.querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = form.getAttribute("key");
    const content = event.target.content.value;
    const completed = event.target.completed.value;
    const completedBool = completed == "1" ? true : false;
 
    update(ref(database, `todo/${id}`), {
      content: content,
      completed: completedBool
    });
    popUp.classList.remove("show");
  } )
  
}

// pagination
const pagination = document.querySelector("[pagination]");
pagination.addEventListener("change", () => {
  const page = pagination.value;
  let url = new URL(location.href);
  url.searchParams.set("page", page);
 
  location.href = url.href;
})