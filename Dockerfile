# Use lightweight Python 3.11 image
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt ./

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir python-dotenv

# Copy the backend code and local databases
COPY backend/ ./backend/

# Copy the pre-built frontend distribution
COPY frontend/dist/ ./frontend/dist/

# Set the working directory to backend so uvicorn can find main:app
WORKDIR /app/backend

# Cloud Run sets the PORT environment variable (default 8080)
ENV PORT=8080

# Run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
