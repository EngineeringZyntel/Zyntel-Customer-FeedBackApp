from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import json
from datetime import datetime
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import qrcode
from io import BytesIO
import base64
from PIL import Image
import hashlib
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Forms table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS forms (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            form_code VARCHAR(20) UNIQUE NOT NULL,
            fields JSONB NOT NULL,
            logo_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Responses table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS responses (
            id SERIAL PRIMARY KEY,
            form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
            response_data JSONB NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Add default admin user
    default_email = "admin@example.com"
    default_password = "admin123"
    default_password_hash = hashlib.sha256(default_password.encode()).hexdigest()
    
    try:
        # Check if default user already exists
        cur.execute('SELECT id FROM users WHERE email = %s', (default_email,))
        existing_user = cur.fetchone()
        
        if not existing_user:
            # Insert default user
            cur.execute('''
                INSERT INTO users (email, password_hash)
                VALUES (%s, %s)
                RETURNING id, email
            ''', (default_email, default_password_hash))
            
            default_user = cur.fetchone()
            print(f"✅ Default user created: {default_user['email']} / {default_password}")
            
            # Optionally create a sample form for the default user
            sample_form_code = "DEMO123"
            sample_fields = [
                {"label": "Your Name", "type": "text"},
                {"label": "Email Address", "type": "email"},
                {"label": "Rating (1-5)", "type": "number"},
                {"label": "Comments", "type": "textarea"}
            ]
            
            cur.execute('''
                INSERT INTO forms (user_id, title, description, form_code, fields)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (form_code) DO NOTHING
            ''', (
                default_user['id'], 
                "Sample Feedback Form",
                "Please share your feedback with us",
                sample_form_code,
                json.dumps(sample_fields)
            ))
            
            print(f"✅ Sample form created with code: {sample_form_code}")
            print(f"✅ Sample form URL: http://localhost:8080/form/{sample_form_code}")
    except Exception as e:
        print(f"⚠️ Could not create default user: {e}")
    
    conn.commit()
    cur.close()
    conn.close()

# Auth endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id, email',
                    (email, password_hash))
        user = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'user': user}), 201
    except psycopg2.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT id, email FROM users WHERE email = %s AND password_hash = %s',
                (email, password_hash))
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if user:
        return jsonify({'user': user}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

# Form endpoints
@app.route('/api/forms', methods=['POST'])
def create_form():
    data = request.json
    user_id = data.get('user_id')
    title = data.get('title')
    description = data.get('description', '')
    fields = data.get('fields', [])
    logo_data = data.get('logo_data')
    
    form_code = secrets.token_urlsafe(8)
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        INSERT INTO forms (user_id, title, description, form_code, fields, logo_data)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, title, description, form_code, fields, logo_data, created_at
    ''', (user_id, title, description, form_code, fields, logo_data))
    form = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'form': form}), 201

@app.route('/api/forms/user/<int:user_id>', methods=['GET'])
def get_user_forms(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT f.*, COUNT(r.id) as response_count
        FROM forms f
        LEFT JOIN responses r ON f.id = r.form_id
        WHERE f.user_id = %s
        GROUP BY f.id
        ORDER BY f.created_at DESC
    ''', (user_id,))
    forms = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify({'forms': forms}), 200

@app.route('/api/forms/<form_code>', methods=['GET'])
def get_form_by_code(form_code):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT id, title, description, fields, logo_data FROM forms WHERE form_code = %s',
                    (form_code,))
        form = cur.fetchone()
        cur.close()
        conn.close()
        
        if form:
            # Ensure fields is properly formatted
            if isinstance(form['fields'], str):
                try:
                    form['fields'] = json.loads(form['fields'])
                except:
                    pass
            return jsonify({'form': form}), 200
        return jsonify({'error': 'Form not found', 'form_code': form_code}), 404
    except Exception as e:
        print(f"Error fetching form {form_code}: {e}")
        return jsonify({'error': 'Server error', 'message': str(e)}), 500

@app.route('/api/forms/<int:form_id>', methods=['DELETE'])
def delete_form(form_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('DELETE FROM forms WHERE id = %s', (form_id,))
    conn.commit()
    cur.close()
    conn.close()
    
    return jsonify({'message': 'Form deleted'}), 200

# Response endpoints
@app.route('/api/responses', methods=['POST'])
def submit_response():
    data = request.json
    form_code = data.get('form_code')
    response_data = data.get('response_data')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get form details
    cur.execute('SELECT id, user_id, title FROM forms WHERE form_code = %s', (form_code,))
    form = cur.fetchone()
    
    if not form:
        cur.close()
        conn.close()
        return jsonify({'error': 'Form not found'}), 404
    
    # Insert response
    cur.execute('''
        INSERT INTO responses (form_id, response_data)
        VALUES (%s, %s)
        RETURNING id, submitted_at
    ''', (form['id'], response_data))
    response = cur.fetchone()
    
    # Get user email for notification
    cur.execute('SELECT email FROM users WHERE id = %s', (form['user_id'],))
    user = cur.fetchone()
    
    conn.commit()
    cur.close()
    conn.close()
    
    # Send email notification (simplified - configure SMTP settings)
    try:
        send_notification_email(user['email'], form['title'], response_data)
    except Exception as e:
        print(f"Email notification failed: {e}")
    
    return jsonify({'message': 'Response submitted', 'response': response}), 201

@app.route('/api/responses/form/<int:form_id>', methods=['GET'])
def get_form_responses(form_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        SELECT id, response_data, submitted_at
        FROM responses
        WHERE form_id = %s
        ORDER BY submitted_at DESC
    ''', (form_id,))
    responses = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify({'responses': responses}), 200

@app.route('/api/stats/<int:form_id>', methods=['GET'])
def get_form_stats(form_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get total responses
    cur.execute('SELECT COUNT(*) as total FROM responses WHERE form_id = %s', (form_id,))
    total = cur.fetchone()['total']
    
    # Get responses by day (last 7 days)
    cur.execute('''
        SELECT DATE(submitted_at) as date, COUNT(*) as count
        FROM responses
        WHERE form_id = %s AND submitted_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(submitted_at)
        ORDER BY date
    ''', (form_id,))
    daily_stats = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify({
        'total': total,
        'daily_stats': daily_stats
    }), 200

# QR Code generation
@app.route('/api/qrcode', methods=['POST'])
def generate_qrcode():
    data = request.json
    form_code = data.get('form_code')
    logo_data = data.get('logo_data')
    form_url = data.get('form_url')
    
    # Use provided URL or construct from request
    if not form_url:
        # Try to get frontend URL from environment or construct
        frontend_url = os.getenv('FRONTEND_URL', request.host_url.rstrip('/'))
        form_url = f"{frontend_url}/form/{form_code}"
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(form_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Add logo if provided
    if logo_data:
        try:
            logo_bytes = base64.b64decode(logo_data.split(',')[1])
            logo = Image.open(BytesIO(logo_bytes))
            
            # Resize logo
            logo_size = min(img.size[0] // 4, img.size[1] // 4)
            logo = logo.resize((logo_size, logo_size))
            
            # Paste logo in center
            pos = ((img.size[0] - logo_size) // 2, (img.size[1] - logo_size) // 2)
            img.paste(logo, pos)
        except Exception as e:
            print(f"Logo error: {e}")
    
    # Convert to base64
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return jsonify({'qrcode': f'data:image/png;base64,{img_str}'}), 200

def send_notification_email(to_email, form_title, response_data):
    """Send email notification - configure SMTP settings via environment variables"""
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not smtp_user or not smtp_password:
        return
    
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg['Subject'] = f'New Response: {form_title}'
    
    body = f"You have received a new response for '{form_title}'.\n\nResponse details:\n{response_data}"
    msg.attach(MIMEText(body, 'plain'))
    
    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)
    server.quit()

@app.route('/')
def index():
    return jsonify({'message': 'Feedback App API'}), 200

# Handle favicon requests
@app.route('/favicon.ico')
def favicon():
    return '', 204  # No Content - prevents 404 error

# Serve frontend static files
@app.route('/<path:path>')
def serve_frontend(path):
    # Don't serve API routes
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    # Handle favicon
    if path == 'favicon.ico':
        return '', 204
    
    # Serve index.html for all non-API routes (SPA routing)
    if '.' not in path or path.endswith('.html'):
        return send_from_directory('../frontend', 'index.html')
    
    # Serve other static files
    return send_from_directory('../frontend', path)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5001)