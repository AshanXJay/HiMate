
import pymysql
import sys

try:
    conn = pymysql.connect(user='root', password='', host='127.0.0.1')
    cursor = conn.cursor()
    
    print("Dropping database...")
    cursor.execute("DROP DATABASE IF EXISTS himate_db")
    print("Dropped.")
    
    print("Creating database...")
    cursor.execute("CREATE DATABASE himate_db")
    print("Created.")
    
    conn.select_db('himate_db')
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"Tables after reset: {tables}")
    
    if tables:
        print("ERROR: Database not empty!")
        sys.exit(1)
    else:
        print("SUCCESS: Database is empty.")

    conn.close()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
