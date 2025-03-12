from dotenv import load_dotenv
from fastapi.responses import RedirectResponse, Response, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager
import mysql.connector
from mysql.connector import Error
from fastapi import (
    FastAPI,
    HTTPException,
    Query,
    Request,
    Depends,
    Response as FastAPIResponse,
    Form,
)
from pydantic import BaseModel
import uuid

from app.database import init_db, clear_db

load_dotenv()
# Updated sensor types to match our database initialization (temperature, humidity, pressure)
VALID_SENSORS = {"temperature", "pressure"}

# Simple global session store for demonstration purposes only.
sessions = {}


def get_current_user(request: Request):
    session_token = request.cookies.get("session_token")
    if session_token and session_token in sessions:
        return sessions[session_token]
    raise HTTPException(status_code=401, detail="Not authenticated")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # Corrected function name
    yield


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


def get_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "db"),
            user=os.getenv("MYSQL_USER"),
            password=os.getenv("MYSQL_PASSWORD"),
            database=os.getenv("MYSQL_DATABASE"),
        )
        if connection.is_connected():
            return connection
    except Error as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {e}")
    return None


# -------------------------------
# Pydantic Models
# -------------------------------


# For sensor data endpoints
class SensorDataIn(BaseModel):
    device_id: int
    value: float
    unit: str
    timestamp: Optional[str] = None


class SensorDataUpdate(BaseModel):
    value: Optional[float] = None
    unit: Optional[str] = None
    timestamp: Optional[str] = None


# For user management endpoints
class UserCredentials(BaseModel):
    username: str
    password: str


# For device registration endpoints
class DeviceRegistration(BaseModel):
    deviceId: int


# For wardrobe endpoints
class ClothingItem(BaseModel):
    item_name: str
    description: Optional[str] = None


# -------------------------------
# HTML Page Routes
# -------------------------------


@app.get("/", response_class=HTMLResponse)
def get_index():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "index.html")
    with open(file_path, "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())


@app.get("/dashboard", response_class=HTMLResponse)
def get_dashboard(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token or session_token not in sessions:
        return RedirectResponse("/login", status_code=302)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "dashboard.html")
    with open(file_path, "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())


@app.get("/wardrobe", response_class=HTMLResponse)
def get_wardrobe_page(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token or session_token not in sessions:
        return RedirectResponse("/login", status_code=302)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "wardrobe.html")
    with open(file_path, "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())


@app.get("/profile", response_class=HTMLResponse)
def get_profile_page(request: Request):
    session_token = request.cookies.get("session_token")
    if not session_token or session_token not in sessions:
        return RedirectResponse("/login", status_code=302)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "profile.html")
    with open(file_path, "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())


@app.get("/login", response_class=HTMLResponse)
def get_login_page():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "login.html")
    with open(file_path, "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())


@app.get("/signup", response_class=HTMLResponse)
def get_signup_page():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, "signup.html")
    with open(file_path, "r", encoding="utf-8") as file:
        return HTMLResponse(content=file.read())


# -------------------------------
# Database Clear Endpoint
# -------------------------------


@app.get("/cleardb")
async def clear_database():  # TODO: REMOVE PRIOR TO PRODUCTION DEPLOYMENT
    """
    ONLY FOR TESTING PURPOSES
    """
    try:
        clear_db()
        init_db()
        return JSONResponse({"Response": "Database cleared successfully"})
    except Error as e:
        return JSONResponse({"Response": f"Database clearing errored {e}"})


# -------------------------------
# Sensor Endpoints (Existing)
# -------------------------------


@app.get("/api/sensors/{sensor_type}")
def sensor_get(
    sensor_type: str,
    order_by: Optional[str] = Query(None, alias="order-by"),
    start_date: Optional[str] = Query(None, alias="start-date"),
    end_date: Optional[str] = Query(None, alias="end-date"),
):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")
    query = f"SELECT * FROM `{sensor_type}`"
    conditions = []
    params = []
    if start_date:
        conditions.append("timestamp >= %s")
        params.append(start_date)
    if end_date:
        conditions.append("timestamp <= %s")
        params.append(end_date)
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    if order_by:
        if order_by not in ["value", "timestamp"]:
            raise HTTPException(status_code=400, detail="Invalid order-by parameter")
        query += f" ORDER BY `{order_by}`"
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params)
        results = cursor.fetchall()
        cursor.close()
        connection.close()
        for record in results:
            if "value" in record and record["value"] is not None:
                try:
                    record["value"] = float(record["value"])
                except (ValueError, TypeError):
                    record["value"] = None
        return results
    except Error:
        raise HTTPException(status_code=500, detail="Database query error")


@app.post("/api/sensors/{sensor_type}")
def create_sensor_data(sensor_type: str, data: SensorDataIn):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")
    if data.timestamp is None:
        data.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    insert_query = "INSERT INTO readings (device_id, reading, reading_type, timestamp) VALUES (%s, %s, %s, %s)"
    try:
        connection = get_connection()
        cursor = connection.cursor()
        value_float = float(data.value)
        cursor.execute(
            insert_query, (data.device_id, data.value, data.unit, data.timestamp)
        )
        connection.commit()
        new_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return {"id": new_id}
    except Error:
        raise HTTPException(status_code=500, detail="Database insert error")


@app.get("/api/sensors/{sensor_type}/count")
def count_sensor_data(sensor_type: str):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")
    count_query = f"SELECT COUNT(*) as count FROM `{sensor_type}`"
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(count_query)
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return result["count"]
    except Error:
        raise HTTPException(status_code=500, detail="Database query error")


@app.get("/api/sensors/{sensor_type}/{id}")
def get_sensor_data_by_id(sensor_type: str, id: int):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")
    select_query = f"SELECT * FROM `{sensor_type}` WHERE id = %s"
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(select_query, (id,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        if not result:
            raise HTTPException(status_code=404, detail="Record not found")
        if "value" in result and result["value"] is not None:
            try:
                result["value"] = float(result["value"])
            except (ValueError, TypeError):
                result["value"] = None
        return result
    except Error:
        raise HTTPException(status_code=500, detail="Database query error")


@app.put("/api/sensors/{sensor_type}/{id}")
def update_sensor_data(sensor_type: str, id: int, data: SensorDataUpdate):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")
    update_fields = []
    params = []
    if data.value is not None:
        update_fields.append("value = %s")
        params.append(float(data.value))
    if data.unit is not None:
        update_fields.append("unit = %s")
        params.append(data.unit)
    if data.timestamp is not None:
        update_fields.append("timestamp = %s")
        params.append(data.timestamp)
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    update_query = (
        f"UPDATE `{sensor_type}` SET " + ", ".join(update_fields) + " WHERE id = %s"
    )
    params.append(id)
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(update_query, params)
        connection.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Record not found")
        cursor.close()
        connection.close()
        return {"detail": "Record updated successfully"}
    except Error:
        raise HTTPException(status_code=500, detail="Database update error")


@app.delete("/api/sensors/{sensor_type}/{id}")
def delete_sensor_data(sensor_type: str, id: int):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")
    delete_query = f"DELETE FROM `{sensor_type}` WHERE id = %s"
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(delete_query, (id,))
        connection.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Record not found")
        cursor.close()
        connection.close()
        return {"detail": "Record deleted successfully"}
    except Error:
        raise HTTPException(status_code=500, detail="Database delete error")


# -------------------------------
# User Management Endpoints
# -------------------------------


@app.post("/signup")
def signup(
    name: str = Form(...),
    location: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    # Check if the username already exists
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        connection.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    cursor.execute(
        "INSERT INTO users (email, password, name, location) VALUES (%s, %s, %s, %s)",
        (email, password, name, location),
    )
    connection.commit()
    user_id = cursor.lastrowid
    cursor.close()
    connection.close()
    # Create a session token and set it as an httpOnly cookie
    session_token = str(uuid.uuid4())
    sessions[session_token] = {"id": user_id, "email": email}
    response = RedirectResponse("/profile", status_code=302)
    response.set_cookie(key="session_token", value=session_token, httponly=True)
    return response


@app.post("/login")
def signin(
    email: str = Form(...),
    password: str = Form(...),
):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM users WHERE email = %s AND password = %s",
        (email, password),
    )
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    session_token = str(uuid.uuid4())
    sessions[session_token] = {"id": user["id"], "email": user["email"]}

    # Redirect with JavaScript to store isLoggedIn in localStorage
    response_html = """
    <script>
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "/profile";
    </script>
    """

    response = HTMLResponse(content=response_html)
    response.set_cookie(key="session_token", value=session_token, httponly=True)
    return response


@app.post("/signout")
def signout(response: Response, request: Request):
    session_token = request.cookies.get("session_token")
    if session_token and session_token in sessions:
        sessions.pop(session_token)
    response.delete_cookie(key="session_token")

    response_html = """
    <script>
        localStorage.removeItem("isLoggedIn");
        window.location.href = "/login";
    </script>
    """

    return HTMLResponse(content=response_html)


# -------------------------------
# Device Registration Endpoints
# -------------------------------


@app.post("/api/devices/register")
def register_device(
    device: int = Form(...),  # data: DeviceRegistration,  # device: int = Form(...),
    current_user: dict = Depends(get_current_user),
):
    device_id = device
    # device_id = data.deviceId
    connection = get_connection()
    cursor = connection.cursor()

    # Check if the device is already registered for the current user.
    cursor.execute(
        "SELECT * FROM user_devices WHERE user_id = %s AND device_id = %s",
        (current_user["id"], device_id),
    )
    if cursor.fetchone():
        cursor.close()
        connection.close()
        raise HTTPException(status_code=400, detail="Device already registered")

    cursor.execute(
        "INSERT INTO user_devices (user_id, device_id) VALUES (%s, %s)",
        (current_user["id"], device_id),
    )
    connection.commit()
    cursor.close()
    connection.close()
    return {"detail": "Device registered successfully"}


@app.get("/api/devices")
def list_devices(current_user: dict = Depends(get_current_user)):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM user_devices WHERE user_id = %s", (current_user["id"],)
    )
    devices = cursor.fetchall()
    cursor.close()
    connection.close()
    return devices


@app.delete("/api/delete-device/{device_id}")
def delete_device(device_id: int, current_user: dict = Depends(get_current_user)):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    # Check if the device is registered for the current user.
    cursor.execute(
        "SELECT * FROM user_devices WHERE user_id = %s AND device_id = %s",
        (current_user["id"], device_id),
    )
    device = cursor.fetchone()
    if not device:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="Device not found")

    # Delete the device.
    cursor.execute(
        "DELETE FROM user_devices WHERE user_id = %s AND device_id = %s",
        (current_user["id"], device_id),
    )
    connection.commit()
    cursor.close()
    connection.close()
    return {"detail": "Device deleted successfully"}


# -------------------------------
# Wardrobe Endpoints
# -------------------------------
# (Assumes a "clothes" table exists with fields: id, user_id, item_name, description, timestamp)


@app.post("/api/wardrobe/items")
def add_clothing_item(
    item_name: str = Form(...),
    item_desc: str = Form(...),
    current_user: dict = Depends(get_current_user),
):
    connection = get_connection()
    cursor = connection.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute(
        "INSERT INTO clothes (user_id, item_name, item_desc, timestamp) VALUES (%s, %s, %s, %s)",
        (current_user["id"], item_name, item_desc, timestamp),
    )
    connection.commit()
    new_id = cursor.lastrowid

    # Return the item with id, name, and description
    cursor.execute(
        "SELECT id, item_name, item_desc FROM clothes WHERE id = %s", (new_id,)
    )
    item = cursor.fetchone()

    cursor.close()
    connection.close()

    return {
        "id": item[0],
        "itme_name": item[1],
        "item_desc": item[2],
    }  # Return the full item


@app.get("/api/wardrobe/items")
def get_clothing_items(current_user: dict = Depends(get_current_user)):
    return get_user_clothes(current_user["id"])


# def get_clothing_items(current_user: dict = Depends(get_current_user)):
#     connection = get_connection()
#     cursor = connection.cursor(dictionary=True)
#     cursor.execute("SELECT * FROM clothes WHERE user_id = %s", (current_user["id"],))
#     items = cursor.fetchall()
#     cursor.close()
#     connection.close()
#     return items


def get_user_clothes(user_id: int):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM clothes WHERE user_id = %s", (user_id,))
    items = cursor.fetchall()
    cursor.close()
    connection.close()
    return items


# @app.put("/api/wardrobe/items/{item_id}")
# def update_clothing_item(
#     item_id: int,
#     data: ClothingItem,
#     current_user: dict = Depends(get_current_user),
# ):
#     # raise HTTPException(
#     #     status_code=201,
#     #     detail=f"name: {data.item_name}, desc: {data.description}, id: {item_id}, uid:{current_user['id']}",
#     # )
#     update_query = "UPDATE clothes SET item_name = %s, description = %s WHERE id = %s AND user_id = %s"
#     params = (data.item_name, data.description, item_id, current_user["id"])
#
#     try:
#         connection = get_connection()
#         cursor = connection.cursor()
#         cursor.execute(update_query, params)
#         connection.commit()
#
#         if cursor.rowcount == 0:
#             raise HTTPException(status_code=404, detail="Clothing item not found")
#
#         cursor.close()
#         connection.close()
#         return {"detail": "Clothing item updated successfully"}
#     except Error:
#         raise HTTPException(status_code=500, detail="Database update error")


@app.put("/api/wardrobe/items/{item_id}")
def update_clothing_item(
    item_id: int,
    data: ClothingItem,
    current_user: dict = Depends(get_current_user),
):
    update_query = "UPDATE clothes SET item_name = %s, item_desc = %s WHERE id = %s AND user_id = %s"
    params = (data.item_name, data.description, item_id, current_user["id"])

    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(update_query, params)
        connection.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Clothing item not found")

        cursor.close()
        connection.close()
        return {"detail": "Clothing item updated successfully"}
    except Error:
        raise HTTPException(status_code=500, detail="Database update error")


@app.delete("/api/wardrobe/items/{item_id}")
def delete_clothing_item(item_id: int, current_user: dict = Depends(get_current_user)):
    connection = get_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM clothes WHERE id = %s AND user_id = %s",
        (item_id, current_user["id"]),
    )
    item = cursor.fetchone()
    if not item:
        cursor.close()
        connection.close()
        raise HTTPException(status_code=404, detail="Clothing item not found")
    cursor.execute("DELETE FROM clothes WHERE id = %s", (item_id,))
    connection.commit()
    cursor.close()
    connection.close()
    return {"detail": "Clothing item deleted"}


# -------------------------------
# Chat endpoints
# -------------------------------

from openai import OpenAI

client = OpenAI(api_key=os.getenv("API_KEY"))


class ChatRequest(BaseModel):
    prompt: str
    weather: str


SYSTEM_PROMPT = "You are a fashion assistant helping users pick clothes, read the user prompt, determine for when the user needs the outfit, and based on the items they have in the wradrobe, as well as the weathehr for the time period mentioned in the user prompt, suggest a few items they can wear. If there are not enough items, suggest generic items of clothing most people would have, but explicitly state that these items are assumed for the user to own. Available clothes and weather are as follows:\n"


@app.post("/chat")
def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    This endpoint accepts a chat prompt about clothes (or any topic)
    and returns a response from an OpenAI GPT model.
    """
    try:
        wardrobe = get_user_clothes(current_user["id"])
        wardrobe_text = f"Available wardrobe items: {wardrobe}"
        weather_data = request.weather
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": f"{SYSTEM_PROMPT}+{wardrobe_text}+{weather_data}",
                },
                {"role": "user", "content": request.prompt},
            ],
            max_tokens=150,
            temperature=0.7,
        )
        answer = response.choices[0].message.content
        return {"response": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app="app.main:app", host="0.0.0.0", port=6543, reload=True)
