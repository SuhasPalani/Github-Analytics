# GitHub Trending Repositories Dashboard

This project is a dynamic dashboard that visualizes trending GitHub repositories using FastAPI for the backend and D3.js for the frontend.

## Features

- Interactive visualization of GitHub trending repositories data
- Multiple chart types: Bar, Line, Scatter, Area, and Pie
- Dark/Light theme toggle
- Customizable data selection
- Repository comparison functionality
- Responsive design

## Setup

### Backend (FastAPI)

1. Navigate to the `backend` directory
2. Install dependencies:
   ```
   pip install fastapi uvicorn
   ```
3. Run the server:
   ```
   uvicorn main:app --reload
   ```

The server will start at `http://localhost:8000`.

### Frontend (React with D3.js)

1. Navigate to the `frontend` directory
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Usage

- Select repositories to compare using the checkboxes
- Choose data points to display
- Select a chart type from the dropdown menu
- Toggle between light and dark themes

## Technologies Used

- Backend: FastAPI
- Frontend: React, D3.js
- Data Visualization: D3.js

