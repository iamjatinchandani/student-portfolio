const BASE_URL = 'http://localhost:5000';

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login'; // Or handle via React Router if preferred
    throw new Error('Unauthorized - Please login');
  }
  if (!res.ok) throw new Error('Request failed');
  return res.json();
};

export const getTasks = () => fetch(`${BASE_URL}/tasks`, {
  headers: getHeaders()
}).then(handleResponse);

export const createTask = (task) => fetch(`${BASE_URL}/tasks`, {
  method: 'POST',
  headers: getHeaders(),
  body: JSON.stringify(task)
}).then(handleResponse);

export const updateTask = (id, updates) => fetch(`${BASE_URL}/tasks/${id}`, {
  method: 'PUT',
  headers: getHeaders(),
  body: JSON.stringify(updates)
}).then(handleResponse);

export const deleteTask = (id) => fetch(`${BASE_URL}/tasks/${id}`, {
  method: 'DELETE',
  headers: getHeaders()
}).then(handleResponse);

export const login = (email, password) => fetch(`${BASE_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
}).then(res => {
  if (!res.ok) throw new Error('Login failed');
  return res.json();
});

export const register = (email, password) => fetch(`${BASE_URL}/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
}).then(res => {
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
});

export const getMe = () => fetch(`${BASE_URL}/me`, {
  headers: getHeaders()
}).then(handleResponse);

