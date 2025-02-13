from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import Response
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles  # Used for serving static files
import uvicorn
import os
from datetime import datetime
from typing import Optional

import mysql.connector
from mysql.connector import Error
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app=FastAPI()



@app.get("/api/{sensor_type}")
def sensor_get(
    sensor_type: str,
    order_by: Optional[str] = Query(None, alias="order-by"),
    start_date: Optional[str] = Query(None, alias="start-date"),
    end_date: Optional[str] = Query(None, alias="end-date")
):



if __name__ == "__main__":
    uvicorn.run(app="app.main:app", host="0.0.0.0", port=6543, reload=True)
