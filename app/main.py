from dotenv import load_dotenv
from fastapi.responses import Response
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles  # Used for serving static files
import uvicorn
import os
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager
import mysql.connector
from mysql.connector import Error
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel

from app.database import seed_db

load_dotenv()
VALID_SENSORS = {"temperature", "humidity", "light"}


# app = FastAPI()
# seed_db()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_db()
    yield


app = FastAPI(lifespan=lifespan)


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


# Pydantic models for incoming data
class SensorDataIn(BaseModel):
    value: float
    unit: str
    timestamp: Optional[str] = None  # Format: YYYY-MM-DD HH:MM:SS


class SensorDataUpdate(BaseModel):
    value: Optional[float] = None
    unit: Optional[str] = None
    timestamp: Optional[str] = None


@app.get("/")
async def root():
    return {"home": "welcome"}


@app.get("/api/{sensor_type}")
def sensor_get(
    sensor_type: str,  # gpt helped with the optional inputs
    order_by: Optional[str] = Query(None, alias="order-by"),
    start_date: Optional[str] = Query(None, alias="start-date"),
    end_date: Optional[str] = Query(None, alias="end-date"),
):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")
    query = f"SELECT * FROM `{sensor_type}`"
    conditions = []
    params = []
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
            if "value" in record:
                try:
                    record["value"] = float(record["value"])
                except (ValueError, TypeError):
                    record["value"] = None  # or leave it unchanged if conversion fails

        print(f"results: {results}")
        return results
    except Error:
        raise HTTPException(status_code=500, detail="Database query error")


@app.post("/api/{sensor_type}")
def create_sensor_data(sensor_type: str, data: SensorDataIn):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")

    if data.timestamp is None:
        data.timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    insert_query = (
        f"INSERT INTO `{sensor_type}` (value, unit, timestamp) VALUES (%s, %s, %s)"
    )

    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(insert_query, (data.value, data.unit, data.timestamp))
        connection.commit()
        new_id = cursor.lastrowid
        cursor.close()
        connection.close()
        return {"id": new_id}
    except Error:
        raise HTTPException(status_code=500, detail="Database insert error")


@app.get("/api/{sensor_type}/{id}")
def get_sensor_data_by_id(sensor_type: str, id: int):
    """
    GET /api/{sensor_type}/{id}
    Returns data for a specific sensor record. If not found, returns 404.
    """
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
        return result
    except Error:
        raise HTTPException(status_code=500, detail="Database query error")


@app.put("/api/{sensor_type}/{id}")
def update_sensor_data(sensor_type: str, id: int, data: SensorDataUpdate):
    if sensor_type not in VALID_SENSORS:
        raise HTTPException(status_code=404, detail="Invalid sensor type")

    update_fields = []
    params = []

    if data.value is not None:
        update_fields.append("value = %s")
        params.append(data.value)
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


@app.delete("/api/{sensor_type}/{id}")
def delete_sensor_data(sensor_type: str, id: int):
    """
    DELETE /api/{sensor_type}/{id}
    Delete a sensor record. Returns 404 if the record does not exist.
    """
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


@app.get("/api/{sensor_type}/count")
def count_sensor_data(sensor_type: str):
    """
    GET /api/{sensor_type}/count
    Returns the total number of rows for the given sensor type.
    """
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
        return result
    except Error:
        raise HTTPException(status_code=500, detail="Database query error")


if __name__ == "__main__":
    uvicorn.run(app="app.main:app", host="0.0.0.0", port=6543, reload=True)
