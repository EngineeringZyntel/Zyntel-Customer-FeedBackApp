# FormFlow - Feedback Form Builder

A beautiful, lightweight feedback form builder similar to Tally.so. Built with vanilla HTML/CSS/JS frontend and Flask backend.

## Features (MVP)

- ✅ User authentication (register/login)
- ✅ Create custom forms with multiple field types
- ✅ Share forms via unique links
- ✅ Real-time form submissions
- ✅ Email notifications on new responses
- ✅ Dashboard with response statistics
- ✅ Visual charts for response analytics
- ✅ QR code generation with logo support
- ✅ Clean, modern UI with distinctive design

## Tech Stack

**Frontend:**
- Vanilla HTML5
- CSS3 (with custom design system)
- Vanilla JavaScript (ES6+)

**Backend:**
- Flask (Python)
- PostgreSQL (via Neon)
- psycopg2 for database
- QRCode library
- Pillow for image processing

**Deployment:**
- Render (backend + frontend)
- Neon (PostgreSQL database)

## Project Structure

```
feedback-app/
├── backend/
│   ├── app.py              # Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Styling
│   └── app.js             # JavaScript logic
├── render.yaml            # Render deployment config
├── .gitignore
└── README.md
```

## Local Development Setup

### Prerequisites
- Python 3.9+
- PostgreSQL (or Neon database)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set environment variables:
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
```

5. Run the backend:
```bash
python app.py
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Update API URL in `frontend/app.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

2. Serve frontend using any static server:
```bash
# Using Python
cd frontend
python -m http.server 8000

# Using Node.js
npx serve frontend
```

Frontend will be available at `http://localhost:8000`

## Deployment on Render

### Step 1: Setup Neon Database

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string (starts with `postgresql://`)

### Step 2: Deploy to Render

1. Push code to GitHub repository

2. Go to [Render Dashboard](https://dashboard.render.com)

3. Click "New" → "Blueprint"

4. Connect your GitHub repository

5. Render will detect `render.yaml` and create services

6. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `SMTP_USER`: Your email for notifications
   - `SMTP_PASSWORD`: Your email app password

### Step 3: Configure Frontend

1. After backend is deployed, copy the backend URL

2. Update `frontend/app.js`:
```javascript
const API_URL = 'https://your-backend-url.onrender.com/api';
```

3. Commit and push changes

4. Render will auto-deploy both services

## Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account

2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new app password
   - Use this as `SMTP_PASSWORD`

## Usage

### Creating a Form

1. Register/Login to your account
2. Click "Create Form"
3. Add form title, description, and logo (optional)
4. Add fields (text, email, number, textarea, dropdown)
5. Click "Create Form"
6. Share the generated link or QR code

### Viewing Responses

1. Go to Dashboard
2. Click on any form card
3. View statistics and charts
4. See individual responses
5. Generate QR code for easy sharing

### Submitting Feedback

1. Open the public form link
2. Fill in the form
3. Submit
4. Form owner receives email notification

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Forms
- `POST /api/forms` - Create new form
- `GET /api/forms/user/:userId` - Get user's forms
- `GET /api/forms/:formCode` - Get form by code
- `DELETE /api/forms/:formId` - Delete form

### Responses
- `POST /api/responses` - Submit response
- `GET /api/responses/form/:formId` - Get form responses

### Analytics
- `GET /api/stats/:formId` - Get form statistics

### QR Code
- `POST /api/qrcode` - Generate QR code

## Future Enhancements

- [ ] Form templates
- [ ] Conditional logic
- [ ] File uploads
- [ ] Custom themes
- [ ] Export responses (CSV, Excel)
- [ ] Advanced analytics
- [ ] Team collaboration
- [ ] Webhook integrations
- [ ] Custom domains
- [ ] Response validation rules
- [ ] Multi-language support
- [ ] Form closing/scheduling

## Security Notes

- Passwords are hashed using SHA-256 (for production, consider bcrypt)
- CORS is enabled for development
- Add rate limiting for production
- Implement CSRF protection
- Use HTTPS in production
- Store sensitive data in environment variables

## License

MIT License - feel free to use for your projects!

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using vanilla web technologies