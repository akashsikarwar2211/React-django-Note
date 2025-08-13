# React-Django Notes Application

A full-stack notes application built with React frontend and Django REST Framework backend.

## Features

- **User Authentication**: Register and login functionality with JWT tokens
- **Create Notes**: Add new notes with title and content
- **View Notes**: Display all notes in a clean interface
- **Delete Notes**: Remove notes you no longer need
- **Responsive Design**: Works on desktop and mobile devices
- **Loading Indicators**: Visual feedback during API calls

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **React Router** for navigation
- **Axios** for API calls
- **CSS** for styling

### Backend
- **Django 4.x** with Django REST Framework
- **SQLite** database (easily switchable to PostgreSQL)
- **JWT Authentication** using djangorestframework-simplejwt
- **CORS** enabled for cross-origin requests

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT token
- `POST /api/token/refresh/` - Refresh JWT token

### Notes
- `GET /api/notes/` - List all notes
- `POST /api/notes/` - Create a new note
- `DELETE /api/notes/delete/<id>/` - Delete a note

## Usage

1. **Register**: Create a new account at `/register`
2. **Login**: Sign in with your credentials at `/login`
3. **Create Notes**: Use the form to add new notes
4. **View Notes**: All notes appear below the creation form
5. **Delete Notes**: Click the delete button on any note

## Development

### Adding New Features

1. **Backend**: Add new models, views, and serializers in the `api` app
2. **Frontend**: Create new components in the `src/components` directory
3. **Styling**: Use CSS modules or styled-components for styling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
