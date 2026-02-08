// Configuration
// Auto-detect environment: use production URL if deployed, otherwise localhost
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001/api'  // Local development
    : 'https://zyntel-feedback.onrender.com/api';  // Production

// State
let currentUser = null;
let currentFormId = null;
let logoData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    handleRouting();
});

// Loading Animation Helper
function showLoading(element, text = 'Loading...') {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (!element) return;
    
    const originalContent = element.innerHTML;
    element.dataset.originalContent = originalContent;
    element.innerHTML = `<span class="loading"></span> ${text}`;
    element.disabled = true;
    return originalContent;
}

function hideLoading(element, originalContent = null) {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    if (!element) return;
    
    element.innerHTML = originalContent || element.dataset.originalContent || '';
    element.disabled = false;
    delete element.dataset.originalContent;
}

function showPageLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.style.display = 'flex';
}

function hidePageLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) loader.style.display = 'none';
}

// Routing
function handleRouting() {
    const path = window.location.pathname;
    const formCode = path.match(/\/form\/([^\/]+)/);
    
    if (formCode) {
        loadPublicForm(formCode[1]);
    } else if (!currentUser) {
        showPage('landing-page');
    }
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
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
        if (!window.location.pathname.match(/\/form\//)) {
            showDashboard();
        }
    } else {
        if (!window.location.pathname.match(/\/form\//)) {
            showPage('landing-page');
        }
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    const originalContent = showLoading(submitBtn, 'Creating...');
    
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
            hideLoading(submitBtn, originalContent);
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        hideLoading(submitBtn, originalContent);
        alert('Network error. Please try again.');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    const originalContent = showLoading(submitBtn, 'Logging in...');
    
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
            hideLoading(submitBtn, originalContent);
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        hideLoading(submitBtn, originalContent);
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
    
    showPageLoading();
    
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
                    <button class="btn-ghost btn-sm" onclick="copyFormLink('${form.form_code}', event)">Copy Link</button>
                    <button class="btn-ghost btn-sm" onclick="deleteForm(${form.id}, event)">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        alert('Error loading forms');
    } finally {
        hidePageLoading();
    }
}

function addField() {
    const container = document.getElementById('fields-container');
    const fieldId = Date.now();
    
    const fieldHtml = `
        <div class="field-item" id="field-${fieldId}" data-field-id="${fieldId}">
            <div class="field-header">
                <input type="text" placeholder="Field Label" class="field-label" required>
                <select class="field-type" onchange="handleFieldTypeChange(${fieldId}, this.value)">
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="tel">Phone</option>
                    <option value="date">Date</option>
                    <option value="textarea">Long Text</option>
                    <option value="select">Dropdown</option>
                    <option value="multiple">Multiple Choice</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="rating">Rating</option>
                </select>
                <button type="button" class="btn-remove" onclick="removeField(${fieldId})">×</button>
            </div>
            <div class="field-options" id="field-options-${fieldId}"></div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', fieldHtml);
}

function handleFieldTypeChange(fieldId, fieldType) {
    const optionsContainer = document.getElementById(`field-options-${fieldId}`);
    if (!optionsContainer) return;
    
    // Clear existing options
    optionsContainer.innerHTML = '';
    
    // Show options editor for dropdown, multiple choice, and checkbox
    if (fieldType === 'select' || fieldType === 'multiple' || fieldType === 'checkbox') {
        const optionsHtml = `
            <div class="field-options-editor">
                <label style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; display: block;">Options:</label>
                <div class="options-list" id="options-list-${fieldId}">
                    <div class="option-item">
                        <input type="text" class="option-input" placeholder="Option 1" value="Option 1">
                        <button type="button" class="btn-remove-small" onclick="removeOption(${fieldId}, this)">×</button>
                    </div>
                    <div class="option-item">
                        <input type="text" class="option-input" placeholder="Option 2" value="Option 2">
                        <button type="button" class="btn-remove-small" onclick="removeOption(${fieldId}, this)">×</button>
                    </div>
                </div>
                <button type="button" class="btn-ghost btn-sm" onclick="addOption(${fieldId})" style="margin-top: 8px;">+ Add Option</button>
            </div>
        `;
        optionsContainer.innerHTML = optionsHtml;
    } else if (fieldType === 'rating') {
        const ratingHtml = `
            <div class="field-options-editor">
                <label style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; display: block;">Max Rating:</label>
                <input type="number" class="rating-max" value="5" min="2" max="10" id="rating-max-${fieldId}" style="width: 80px; padding: 6px; border: 1px solid var(--border); border-radius: 6px;">
            </div>
        `;
        optionsContainer.innerHTML = ratingHtml;
    }
}

function addOption(fieldId) {
    const optionsList = document.getElementById(`options-list-${fieldId}`);
    if (!optionsList) return;
    
    const optionHtml = `
        <div class="option-item">
            <input type="text" class="option-input" placeholder="New option">
            <button type="button" class="btn-remove-small" onclick="removeOption(${fieldId}, this)">×</button>
        </div>
    `;
    optionsList.insertAdjacentHTML('beforeend', optionHtml);
}

function removeOption(fieldId, button) {
    button.closest('.option-item').remove();
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
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    const originalContent = showLoading(submitBtn, 'Creating...');
    
    const fieldElements = document.querySelectorAll('.field-item');
    const fields = Array.from(fieldElements).map(el => {
        const fieldData = {
            label: el.querySelector('.field-label').value,
            type: el.querySelector('.field-type').value
        };
        
        // Add options for dropdown, multiple choice, checkbox
        if (fieldData.type === 'select' || fieldData.type === 'multiple' || fieldData.type === 'checkbox') {
            const optionInputs = el.querySelectorAll('.option-input');
            fieldData.options = Array.from(optionInputs).map(input => input.value).filter(v => v.trim());
        }
        
        // Add max rating for rating field
        if (fieldData.type === 'rating') {
            const maxRating = el.querySelector('.rating-max');
            fieldData.maxRating = maxRating ? parseInt(maxRating.value) || 5 : 5;
        }
        
        return fieldData;
    });
    
    if (fields.length === 0) {
        hideLoading(submitBtn, originalContent);
        alert('Please add at least one field');
        return;
    }
    
    // Validate all fields have labels
    if (fields.some(f => !f.label.trim())) {
        hideLoading(submitBtn, originalContent);
        alert('Please fill in all field labels');
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
            logoData = null;
            showDashboard();
        } else {
            hideLoading(submitBtn, originalContent);
            alert('Error creating form');
        }
    } catch (error) {
        hideLoading(submitBtn, originalContent);
        alert('Network error. Please try again.');
    }
}

async function deleteForm(formId, event) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    showPageLoading();
    
    try {
        await fetch(`${API_URL}/forms/${formId}`, { method: 'DELETE' });
        loadUserForms();
    } catch (error) {
        hidePageLoading();
        alert('Error deleting form');
    }
}

function copyFormLink(formCode, event) {
    if (event) event.stopPropagation();
    const link = `${window.location.origin}/form/${formCode}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
}

// Stats
async function viewFormStats(formId, title, formCode) {
    currentFormId = formId;
    showPage('stats-page');
    
    document.getElementById('stats-form-title').textContent = title;
    
    showPageLoading();
    
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
            responsesList.innerHTML = responsesData.responses.map((response, idx) => {
                const data = JSON.parse(response.response_data);
                const dataHtml = Object.entries(data).map(([key, value]) => 
                    `<div style="margin-bottom: 8px;"><strong>${key}:</strong> ${value}</div>`
                ).join('');
                
                return `
                    <div class="response-item">
                        <div class="response-date">${new Date(response.submitted_at).toLocaleString()}</div>
                        <div class="response-data">${dataHtml}</div>
                    </div>
                `;
            }).join('');
        }
        
        // Store form code for QR generation
        responsesList.dataset.formCode = formCode;
        
    } catch (error) {
        alert('Error loading stats');
    } finally {
        hidePageLoading();
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
    const btn = event.target;
    const originalContent = showLoading(btn, 'Generating...');
    
    try {
        const formUrl = `${window.location.origin}/form/${formCode}`;
        const response = await fetch(`${API_URL}/qrcode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                form_code: formCode,
                form_url: formUrl,
                logo_data: logoData
            })
        });
        
        const data = await response.json();
        
        document.getElementById('qr-display').innerHTML = `
            <img src="${data.qrcode}" alt="QR Code" style="max-width: 300px; margin: 16px 0;">
            <p style="margin-top: 16px;">
                <a href="${data.qrcode}" download="qrcode.png" class="btn-primary">Download QR Code</a>
            </p>
        `;
    } catch (error) {
        alert('Error generating QR code');
    } finally {
        hideLoading(btn, originalContent);
    }
}

// Public Form
async function loadPublicForm(formCode) {
    showPage('public-form-page');
    showPageLoading();
    
    try {
        const response = await fetch(`${API_URL}/forms/${formCode}`);
        const data = await response.json();
        
        if (!response.ok) {
            document.getElementById('public-form-page').innerHTML = `
                <div class="public-form-container">
                    <div class="public-form-box">
                        <h1>Form Not Found</h1>
                        <p>The form you're looking for doesn't exist or has been deleted.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        const form = data.form;
        
        document.getElementById('public-form-title').textContent = form.title;
        document.getElementById('public-form-description').textContent = form.description || '';
        
        if (form.logo_data) {
            document.getElementById('form-logo-container').innerHTML = 
                `<img src="${form.logo_data}" alt="Logo" style="max-width: 150px; margin-bottom: 24px;">`;
        }
        
        const fields = typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields;
        const fieldsHtml = fields.map((field, index) => {
            let inputHtml = '';
            
            switch (field.type) {
                case 'textarea':
                    inputHtml = `<textarea id="field-${index}" name="field-${index}" rows="4" required></textarea>`;
                    break;
                case 'select':
                    const selectOptions = (field.options || []).map(opt => 
                        `<option value="${opt}">${opt}</option>`
                    ).join('');
                    inputHtml = `
                        <select id="field-${index}" name="field-${index}" required>
                            <option value="">Select...</option>
                            ${selectOptions}
                        </select>
                    `;
                    break;
                case 'multiple':
                    const multipleOptions = (field.options || []).map((opt, optIdx) => 
                        `<label style="display: flex; align-items: center; margin-bottom: 8px;">
                            <input type="radio" name="field-${index}" value="${opt}" required style="margin-right: 8px;">
                            ${opt}
                        </label>`
                    ).join('');
                    inputHtml = `<div class="multiple-choice">${multipleOptions}</div>`;
                    break;
                case 'checkbox':
                    const checkboxOptions = (field.options || []).map((opt, optIdx) => 
                        `<label style="display: flex; align-items: center; margin-bottom: 8px;">
                            <input type="checkbox" name="field-${index}[]" value="${opt}" style="margin-right: 8px;">
                            ${opt}
                        </label>`
                    ).join('');
                    inputHtml = `<div class="checkbox-group">${checkboxOptions}</div>`;
                    break;
                case 'rating':
                    const maxRating = field.maxRating || 5;
                    const stars = Array.from({ length: maxRating }, (_, i) => i + 1)
                        .map(star => 
                            `<input type="radio" name="field-${index}" value="${star}" id="star-${index}-${star}" required style="display: none;">
                             <label for="star-${index}-${star}" class="star-label" data-rating="${star}">★</label>`
                        ).join('');
                    inputHtml = `<div class="rating-group" data-field="${index}">${stars}</div>`;
                    break;
                case 'date':
                    inputHtml = `<input type="date" id="field-${index}" name="field-${index}" required>`;
                    break;
                default:
                    inputHtml = `<input type="${field.type}" id="field-${index}" name="field-${index}" required>`;
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
        
        // Initialize rating stars
        document.querySelectorAll('.rating-group').forEach(group => {
            const labels = group.querySelectorAll('.star-label');
            labels.forEach((label, idx) => {
                label.addEventListener('click', function() {
                    const rating = parseInt(this.dataset.rating);
                    labels.forEach((l, i) => {
                        if (i < rating) {
                            l.style.color = '#FFD700';
                        } else {
                            l.style.color = '#ccc';
                        }
                    });
                });
            });
        });
        
    } catch (error) {
        document.getElementById('public-form-page').innerHTML = `
            <div class="public-form-container">
                <div class="public-form-box">
                    <h1>Error Loading Form</h1>
                    <p>There was an error loading this form. Please try again later.</p>
                </div>
            </div>
        `;
    } finally {
        hidePageLoading();
    }
}

async function handleSubmitResponse(e) {
    e.preventDefault();
    
    const formCode = e.target.dataset.formCode;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = showLoading(submitBtn, 'Submitting...');
    
    const responseData = {};
    
    const fields = document.querySelectorAll('#public-form-fields .form-group');
    fields.forEach((field, index) => {
        const label = field.querySelector('label').textContent;
        const input = field.querySelector(`#field-${index}, [name="field-${index}"], [name="field-${index}[]"]`);
        
        if (!input) return;
        
        // Handle different input types
        if (input.type === 'checkbox' || input.name.includes('[]')) {
            // Multiple checkboxes
            const checked = field.querySelectorAll(`[name="field-${index}[]"]:checked`);
            responseData[label] = Array.from(checked).map(cb => cb.value).join(', ');
        } else if (input.type === 'radio') {
            // Radio buttons (multiple choice)
            const selected = field.querySelector(`[name="field-${index}"]:checked`);
            responseData[label] = selected ? selected.value : '';
        } else {
            // Regular inputs
            responseData[label] = input.value;
        }
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
            const errorData = await response.json();
            hideLoading(submitBtn, originalContent);
            alert(errorData.error || 'Error submitting response');
        }
    } catch (error) {
        hideLoading(submitBtn, originalContent);
        alert('Network error. Please try again.');
    }
}
