// Seletores
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
let draggedItem = null;

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());

// Carregar tarefas ao iniciar
document.addEventListener('DOMContentLoaded', loadTasks);

// Função para adicionar tarefa
function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const taskItem = document.createElement('li');
    taskItem.className = 'task';
    taskItem.draggable = true;
    taskItem.innerHTML = `
        <span>${taskText}</span>
        <button class="delete-btn">×</button>
    `;

    // Eventos da tarefa
    taskItem.querySelector('.delete-btn').addEventListener('click', deleteTask);
    taskItem.addEventListener('click', toggleDone);
    taskItem.addEventListener('dragstart', dragStart);
    taskItem.addEventListener('dragend', dragEnd);

    taskList.appendChild(taskItem);
    taskInput.value = '';
    saveTasks();
}

// Funções auxiliares
function deleteTask(e) {
    e.stopPropagation();
    const taskItem = e.target.parentElement;
    taskItem.classList.add('deleting');
    setTimeout(() => {
        taskItem.remove();
        saveTasks();
    }, 300);
}

function toggleDone(e) {
    if (e.target.classList.contains('delete-btn')) return;
    this.classList.toggle('done');
    saveTasks();
}

// Drag and Drop
function dragStart() {
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
}

function dragEnd() {
    this.classList.remove('dragging');
}

taskList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.clientY);
    if (afterElement) {
        taskList.insertBefore(draggedItem, afterElement);
    } else {
        taskList.appendChild(draggedItem);
    }
});

function getDragAfterElement(y) {
    const tasks = [...document.querySelectorAll('.task:not(.dragging)')];
    return tasks.reduce((closest, task) => {
        const box = task.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        return offset < 0 && offset > closest.offset ? { offset, element: task } : closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterTasks(btn.dataset.filter);
    });
});

function filterTasks(filter) {
    const tasks = document.querySelectorAll('.task');
    tasks.forEach(task => {
        const isDone = task.classList.contains('done');
        task.style.display = 
            filter === 'all' ? 'flex' :
            filter === 'pending' && !isDone ? 'flex' :
            filter === 'done' && isDone ? 'flex' : 'none';
    });
}

// LocalStorage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task').forEach(task => {
        tasks.push({
            text: task.querySelector('span').textContent,
            done: task.classList.contains('done')
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => {
        const taskItem = document.createElement('li');
        taskItem.className = `task ${task.done ? 'done' : ''}`;
        taskItem.draggable = true;
        taskItem.innerHTML = `
            <span>${task.text}</span>
            <button class="delete-btn">×</button>
        `;
        taskItem.querySelector('.delete-btn').addEventListener('click', deleteTask);
        taskItem.addEventListener('click', toggleDone);
        taskItem.addEventListener('dragstart', dragStart);
        taskItem.addEventListener('dragend', dragEnd);
        taskList.appendChild(taskItem);
    });
}