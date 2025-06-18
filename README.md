# Joyverse - Testing Instructions

## Test Credentials

### Test Therapist
- **Email:** therapist@joyverse.com
- **Password:** password123
- **Therapist ID:** 6852586bd1242044d0686343

### For Testing User Signup
Use the following test data:
- **Name:** Test User
- **Email:** testuser@example.com
- **Password:** Password123
- **Age:** 10
- **Gender:** male
- **Therapist ID:** 6852586bd1242044d0686343

## Quick Start

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on: http://localhost:5000

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on: http://localhost:3000

3. **Test the Application:**
   - Go to http://localhost:3000/signup to create a new user account
   - Go to http://localhost:3000/login to login as either user or therapist

## API Endpoints

- **POST /api/signup** - User registration (for kids only)
- **POST /api/login** - Login for both users and therapists
- **GET /api/profile/:id** - Get user/therapist profile

## Database
Make sure MongoDB is running and the connection string in the backend `.env` file is correct.
