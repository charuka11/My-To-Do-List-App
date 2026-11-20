
// Get HTML Elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const remainingCount = document.getElementById("remainingCount");

const emptyMessage = document.getElementById("emptyMessage");
const clearBtn = document.getElementById("clearBtn");
const themeBtn = document.getElementById("themeBtn");
const addBtn = document.getElementById("addBtn");

const filterButtons = document.querySelectorAll(".filter-btn");


// Load Tasks from Local Storage
let tasks = [];
try {
    const savedTasks = JSON.parse(localStorage.getItem("myTasks"));
    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    tasks = [];
}

// Current Filter and Edit ID
let currentFilter = "all";
let editingId = null;
let draggedItem = null; 


// Save Tasks
function saveTasks() {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
}


// Add or Update Task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskName = taskInput.value.trim();

    if (taskName === "") {
        alert("Please enter a task!");
        return;
    }

    if (editingId !== null) {
        const task = tasks.find(function(item) {
            return item.id === editingId;
        });

        if (task) {
            task.text = taskName;
            task.priority = priorityInput.value;
            task.date = dateInput.value;
        }

        editingId = null;
        addBtn.textContent = "Add Task";

    } else {
        const newTask = {
            id: Date.now() + Math.random(),
            text: taskName,
            priority: priorityInput.value,
            date: dateInput.value,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();
    taskForm.reset();
    priorityInput.value = "Medium";
    renderTasks();
});


// Render Tasks
function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks = tasks.filter(function(task) {
            return !task.completed;
        });
    }

    if (currentFilter === "completed") {
        filteredTasks = tasks.filter(function(task) {
            return task.completed;
        });
    }

    filteredTasks.forEach(function(task) {
        const li = document.createElement("li");
        li.className = "task-item";
        
        li.setAttribute("draggable", "true");
        li.dataset.id = task.id;

        if (task.completed) {
            li.classList.add("completed");
        }

        // Task Left Side
        const left = document.createElement("div");
        left.className = "task-left";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");

        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const content = document.createElement("div");
        content.className = "task-content";

        const text = document.createElement("span");
        text.className = "task-text";
        
        
        if (task.completed) {
            text.innerHTML = `<span style="color: #18864b; font-weight: bold; margin-right: 5px;">✓</span> ${task.text}`;
        } else {
            text.textContent = task.text;
        }

        content.appendChild(text);

        // Task Meta Information
        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        priority.className = "priority " + task.priority;
        priority.textContent = task.priority;
        meta.appendChild(priority);

        if (task.date) {
            const dueDate = document.createElement("span");
            dueDate.className = "due-date";
            dueDate.textContent = "Due: " + task.date;
            meta.appendChild(dueDate);
        }

        content.appendChild(meta);
        left.appendChild(checkbox);
        left.appendChild(content);

        // Action Buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", function() {
            editTask(task.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", function() {
            deleteTask(task.id);
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(left);
        li.appendChild(actions);

        // Drag and Drop Events
        li.addEventListener("dragstart", function(e) {
            draggedItem = li;
            setTimeout(() => li.classList.add("dragging"), 0);
        });

        li.addEventListener("dragend", function() {
            draggedItem = null;
            li.classList.remove("dragging");
            
            const currentItems = [...taskList.querySelectorAll(".task-item")];
            const newOrderIds = currentItems.map(item => Number(item.dataset.id));

            const sortedTasks = [];
            newOrderIds.forEach(id => {
                const foundTask = tasks.find(t => t.id === id);
                if (foundTask) sortedTasks.push(foundTask);
            });
            
            tasks.forEach(task => {
                if (!newOrderIds.includes(task.id)) {
                    sortedTasks.push(task);
                }
            });

            tasks = sortedTasks;
            saveTasks();
        });

        li.addEventListener("dragover", function(e) {
            e.preventDefault(); 
            if (draggedItem && draggedItem !== li) {
                const allItems = [...taskList.querySelectorAll(".task-item")];
                const draggedIndex = allItems.indexOf(draggedItem);
                const currentIndex = allItems.indexOf(li);

                if (draggedIndex < currentIndex) {
                    li.after(draggedItem); 
                } else {
                    li.before(draggedItem); 
                }
            }
        });

        taskList.appendChild(li);
    });

    // Update Counts
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(function(task) {
        return task.completed;
    }).length;
    const remainingTasks = totalTasks - completedTasks;

    taskCount.textContent = totalTasks + (totalTasks === 1 ? " Task" : " Tasks");
    remainingCount.textContent = remainingTasks + " tasks remaining";

    // Empty Message
    if (filteredTasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}


// Edit Task
function editTask(id) {
    const task = tasks.find(function(item) {
        return item.id === id;
    });

    if (!task) return;

    taskInput.value = task.text;
    priorityInput.value = task.priority;
    dateInput.value = task.date || "";

    editingId = id;
    addBtn.textContent = "Update Task";
    taskInput.focus();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });

    if (editingId === id) {
        editingId = null;
        taskForm.reset();
        priorityInput.value = "Medium";
        addBtn.textContent = "Add Task";
    }

    saveTasks();
    renderTasks();
}


// Clear Completed Tasks
clearBtn.addEventListener("click", function() {
    tasks = tasks.filter(function(task) {
        return !task.completed;
    });

    if (editingId !== null && !tasks.some(function(task) {
        return task.id === editingId;
    })) {
        editingId = null;
        taskForm.reset();
        priorityInput.value = "Medium";
        addBtn.textContent = "Add Task";
    }

    saveTasks();
    renderTasks();
});


// Filter Tasks
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        filterButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});


// Dark Mode
let darkMode = localStorage.getItem("darkMode") === "true";

function updateTheme() {
    document.body.classList.toggle("dark", darkMode);
    themeBtn.textContent = darkMode ? "☀️" : "🌙";
    localStorage.setItem("darkMode", darkMode);
}

themeBtn.addEventListener("click", function() {
    darkMode = !darkMode;
    updateTheme();
});


// Initial App Setup
updateTheme();
renderTasks();