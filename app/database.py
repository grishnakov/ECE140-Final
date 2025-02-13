import os
import csv
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def seed_db():
    # Get environment variables for connecting to MySQL
    db_host = os.getenv("MYSQL_HOST", "db")
    db_user = os.getenv("MYSQL_USER")
    db_password = os.getenv("MYSQL_PASSWORD")
    db_database = os.getenv("MYSQL_DATABASE")

    try:
        connection = mysql.connector.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_database,
        )

        if connection.is_connected():
            cursor = connection.cursor()
            csv_files = {
                "temperature": "./sample/temperature.csv",
                "humidity": "./sample/humidity.csv",
                "pressure": "./sample/pressure.csv",
            }

            for table_name, csv_path in csv_files.items():
                print(f"Processing {csv_path} for table `{table_name}`...")
                # Open the CSV file and use DictReader to work with header names.
                with open(csv_path, mode="r", newline="") as csvfile:
                    reader = csv.DictReader(csvfile)
                    headers = reader.fieldnames

                    if not headers:
                        print(f"No headers found in {csv_path}. Skipping.")
                        continue

                    columns_definition = ", ".join(
                        [f"`{col}` VARCHAR(255)" for col in headers]
                    )
                    create_table_query = f"""
                    CREATE TABLE IF NOT EXISTS `{table_name}` (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        {columns_definition}
                    );
                    """
                    cursor.execute(create_table_query)
                    print(f"Table `{table_name}` created (if it did not exist).")

                    placeholders = ", ".join(["%s"] * len(headers))
                    columns_list = ", ".join([f"`{col}`" for col in headers])
                    insert_query = f"INSERT INTO `{table_name}` ({columns_list}) VALUES ({placeholders})"

                    data = []
                    for row in reader:
                        row_values = [row[col] for col in headers]
                        data.append(row_values)

                    # Use executemany() for batch insertion if there is data.
                    if data:
                        cursor.executemany(insert_query, data)
                        connection.commit()
                        print(
                            f"Inserted {cursor.rowcount} records into `{table_name}`."
                        )
                    else:
                        print(
                            f"No data found in {csv_path} to insert into `{table_name}`."
                        )

            cursor.close()
        connection.close()
    except Error as e:
        print("Error while connecting to MySQL", e)
