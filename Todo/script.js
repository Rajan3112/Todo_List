const API_URL = 'https://dummyjson.com/todos';
let todos = [];
let currentPage = 1;
const itemsPerPage = 5;

async function fetchTodos() {
  showLoading();
  try {
    const res = await fetch(`${API_URL}`);
    const data = await res.json();
    todos = data.todos;
    renderTodos();
    hideError();
  } catch (err) {
    showError('Failed to fetch todos');
  }
  hideLoading();
}

function renderTodos(filtered = todos) {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginated = filtered.slice(start, end);

  const list = document.getElementById('todoList');
  list.innerHTML = '';
  paginated.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = todo.todo;
    list.appendChild(li);
  });

  renderPagination(filtered.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', () => {
      currentPage = i;
      renderTodos(filterTodos());
    });
    pagination.appendChild(li);
  }
}

document.getElementById('addTodoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('todoInput');
  const newTask = input.value.trim();
  if (!newTask) return;

  showLoading();
  try {
    const res = await fetch(API_URL + '/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todo: newTask,
        completed: false,
        userId: 1
      })
    });
    const data = await res.json();
    todos.unshift(data);
    input.value = '';
    currentPage = 1;
    renderTodos(filterTodos());
    hideError();
  } catch (err) {
    showError('Failed to add todo');
  }
  hideLoading();
});

document.getElementById('searchInput').addEventListener('input', () => {
  currentPage = 1;
  renderTodos(filterTodos());
});

function applyFilters() {
  currentPage = 1;
  renderTodos(filterTodos());
}

function filterTodos() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const from = new Date(document.getElementById('fromDate').value);
  const to = new Date(document.getElementById('toDate').value);

  return todos.filter(todo => {
    const matchesSearch = todo.todo.toLowerCase().includes(search);
    const createdDate = new Date(todo.createdAt || '2024-01-01'); 

    const matchesFrom = isNaN(from.getTime()) || createdDate >= from;
    const matchesTo = isNaN(to.getTime()) || createdDate <= to;

    return matchesSearch && matchesFrom && matchesTo;
  });
 }

function showLoading() {
  document.getElementById('loading').classList.remove('d-none');
 }
function hideLoading() {
  document.getElementById('loading').classList.add('d-none');
 }
function showError(message) {
  const error = document.getElementById('error');
  error.textContent = message;
  error.classList.remove('d-none');
 }
function hideError() {
  document.getElementById('error').classList.add('d-none');
 }

fetchTodos();
