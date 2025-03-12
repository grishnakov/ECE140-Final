# FROM python:3.9
#
# WORKDIR /code
#
# COPY ./requirements.txt /code/requirements.txt
#
# RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
#
# # COPY ./app /code/app
#
# # COPY ./sample /code/sample
#
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "6543", "--reload"]
FROM python:3.9-slim

WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt supervisor

# Copy your application code (including both app/main.py and Server/main.py)
COPY . .

# Copy the Supervisor configuration file into the container
COPY supervisord.conf /app/supervisord.conf

# Expose necessary ports (example: FastAPI on 6543)
EXPOSE 6543

# Run Supervisor which will launch both Python scripts
CMD ["supervisord", "-c", "/app/supervisord.conf"]
