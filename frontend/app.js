// Configuration
const API_URL = 'https://your-backend-url.onrender.com/api'; // Update this after deployment

// State
let currentUser = null;
let currentFormId = null;
let logoData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    handleRouting();
});

// Routing
function handleRouting() {
    const path = window.location.pathname;
    const formCode = path.match(/\/form\/([^\/]+)/);
    
    if (formCode) {
        loadPublicForm(formCode[1]);
    }
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showLogin() {
    showPage('login-page');
}

function showRegister() {
    showPage('register-page');
}

function showDashboard() {
    showPage('dashboard-page');
    loadUserForms();
}

function showCreateForm() {
    showPage('create-form-page');
    document.getElementById('fields-container').innerHTML = '';
    addField(); // Add one field by default
}

// Auth
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        showDashboard();
    } else {
        showPage('landing-page');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            showDashboard();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            showDashboard();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    showPage('landing-page');
}

// Forms
async function loadUserForms() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/forms/user/${currentUser.id}`);
        const data = await response.json();
        
        const grid = document.getElementById('forms-grid');
        
        if (data.forms.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No forms yet. Create your first form!</p>';
            return;
        }
        
        grid.innerHTML = data.forms.map(form => `
            <div class="form-card">
                <div onclick="viewFormStats(${form.id}, '${form.title}', '${form.form_code}')">
                    <div class="form-card-title">${form.title}</div>
                    <div class="form-card-meta">
                        <span class="form-card-responses">${form.response_count} responses</span>
                        <span class="form-card-code">${form.form_code}</span>
                    </div>
                </div>
                <div class="form-card-actions">
                    <button class="btn-ghost btn-sm" onclick="copyFormLink('${form.form_code}')">Copy Link</button>
                    <button class="btn-ghost btn-sm" onclick="deleteForm(${form.id}, event)">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        alert('Error loading forms');
    }
}

function addField() {
    const container = document.getElementById('fields-container');
    const fieldId = Date.now();
    
    const fieldHtml = `
        <div class="field-item" id="field-${fieldId}">
            <input type="text" placeholder="Field Label" class="field-label" required>
            <select class="field-type">
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="textarea">Long Text</option>
                <option value="select">Dropdown</option>
            </select>
            <button type="button" class="btn-remove" onclick="removeField(${fieldId})">×</button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', fieldHtml);
}

function removeField(fieldId) {
    document.getElementById(`field-${fieldId}`).remove();
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            logoData = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function handleCreateForm(e) {
    e.preventDefault();
    
    const title = document.getElementById('form-title').value;
    const description = document.getElementById('form-description').value;
    
    const fieldElements = document.querySelectorAll('.field-item');
    const fields = Array.from(fieldElements).map(el => ({
        label: el.querySelector('.field-label').value,
        type: el.querySelector('.field-type').value
    }));
    
    if (fields.length === 0) {
        alert('Please add at least one field');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/forms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                title,
                description,
                fields: JSON.stringify(fields),
                logo_data: logoData
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Form created! Code: ${data.form.form_code}`);
            showDashboard();
        } else {
            alert('Error creating form');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}

async function deleteForm(formId, event) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
        await fetch(`${API_URL}/forms/${formId}`, { method: 'DELETE' });
        loadUserForms();
    } catch (error) {
        alert('Error deleting form');
    }
}

function copyFormLink(formCode) {
    const link = `${window.location.origin}/form/${formCode}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
}

// Stats
async function viewFormStats(formId, title, formCode) {
    currentFormId = formId;
    showPage('stats-page');
    
    document.getElementById('stats-form-title').textContent = title;
    
    try {
        // Load stats
        const statsResponse = await fetch(`${API_URL}/stats/${formId}`);
        const statsData = await statsResponse.json();
        
        document.getElementById('total-responses').textContent = statsData.total;
        
        // Draw chart
        drawChart(statsData.daily_stats);
        
        // Load responses
        const responsesResponse = await fetch(`${API_URL}/responses/form/${formId}`);
        const responsesData = await responsesResponse.json();
        
        const responsesList = document.getElementById('responses-list');
        
        if (responsesData.responses.length === 0) {
            responsesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No responses yet</p>';
        } else {
            responsesList.innerHTML = responsesData.responses.map(response => `
                <div class="response-item">
                    <div class="response-date">${new Date(response.submitted_at).toLocaleString()}</div>
                    <div class="response-data">${JSON.stringify(JSON.parse(response.response_data), null, 2)}</div>
                </div>
            `).join('');
        }
        
        // Store form code for QR generation
        responsesList.dataset.formCode = formCode;
        
    } catch (error) {
        alert('Error loading stats');
    }
}

function drawChart(dailyStats) {
    const canvas = document.getElementById('responses-chart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    if (dailyStats.length === 0) {
        ctx.fillStyle = '#536471';
        ctx.font = '16px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText('No data for the last 7 days', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const maxValue = Math.max(...dailyStats.map(d => d.count), 1);
    const barWidth = canvas.width / dailyStats.length - 20;
    const padding = 40;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bars
    dailyStats.forEach((stat, index) => {
        const barHeight = (stat.count / maxValue) * (canvas.height - padding * 2);
        const x = index * (barWidth + 20) + 20;
        const y = canvas.height - padding - barHeight;
        
        // Bar
        ctx.fillStyle = '#0066FF';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Value
        ctx.fillStyle = '#0F1419';
        ctx.font = '14px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(stat.count, x + barWidth / 2, y - 5);
        
        // Date
        ctx.fillStyle = '#536471';
        ctx.font = '12px Outfit';
        const date = new Date(stat.date);
        ctx.fillText(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                     x + barWidth / 2, canvas.height - padding + 20);
    });
}

async function generateQRCode() {
    const formCode = document.getElementById('responses-list').dataset.formCode;
    
    try {
        const response = await fetch(`${API_URL}/qrcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                form_code: formCode,
                logo_data: logoData
            })
        });
        
        const data = await response.json();
        
        document.getElementById('qr-display').innerHTML = `
            <img src="${data.qrcode}" alt="QR Code">
            <p style="margin-top: 16px;">
                <a href="${data.qrcode}" download="qrcode.png" class="btn-primary">Download QR Code</a>
            </p>
        `;
    } catch (error) {
        alert('Error generating QR code');
    }
}

// Public Form
async function loadPublicForm(formCode) {
    showPage('public-form-page');
    
    try {
        const response = await fetch(`${API_URL}/forms/${formCode}`);
        const data = await response.json();
        
        if (!response.ok) {
            alert('Form not found');
            return;
        }
        
        const form = data.form;
        
        document.getElementById('public-form-title').textContent = form.title;
        document.getElementById('public-form-description').textContent = form.description || '';
        
        if (form.logo_data) {
            document.getElementById('form-logo-container').innerHTML = 
                `<img src="${form.logo_data}" alt="Logo">`;
        }
        
        const fields = JSON.parse(form.fields);
        const fieldsHtml = fields.map((field, index) => {
            let inputHtml = '';
            
            switch (field.type) {
                case 'textarea':
                    inputHtml = `<textarea id="field-${index}" rows="4" required></textarea>`;
                    break;
                case 'select':
                    inputHtml = `
                        <select id="field-${index}" required>
                            <option value="">Select...</option>
                            <option value="Option 1">Option 1</option>
                            <option value="Option 2">Option 2</option>
                            <option value="Option 3">Option 3</option>
                        </select>
                    `;
                    break;
                default:
                    inputHtml = `<input type="${field.type}" id="field-${index}" required>`;
            }
            
            return `
                <div class="form-group">
                    <label>${field.label}</label>
                    ${inputHtml}
                </div>
            `;
        }).join('');
        
        document.getElementById('public-form-fields').innerHTML = fieldsHtml;
        document.getElementById('public-form').dataset.formCode = formCode;
        
    } catch (error) {
        alert('Error loading form');
    }
}

async function handleSubmitResponse(e) {
    e.preventDefault();
    
    const formCode = e.target.dataset.formCode;
    const formData = new FormData(e.target);
    const responseData = {};
    
    const fields = document.querySelectorAll('#public-form-fields .form-group');
    fields.forEach((field, index) => {
        const label = field.querySelector('label').textContent;
        const input = field.querySelector(`#field-${index}`);
        responseData[label] = input.value;
    });
    
    try {
        const response = await fetch(`${API_URL}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                form_code: formCode,
                response_data: JSON.stringify(responseData)
            })
        });
        
        if (response.ok) {
            document.getElementById('public-form').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
        } else {
            alert('Error submitting response');
        }
    } catch (error) {
        alert('Network error. Please try again.');
    }
}