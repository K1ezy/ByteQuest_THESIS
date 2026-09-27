FROM python:3.11-slim

WORKDIR /app

# Install system compilation packages for GCC (C++) and OpenJDK (Java)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    g++ \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/backend

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
