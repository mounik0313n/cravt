import sqlite3
import os

# Database file path
DB_PATH = os.path.join(os.getcwd(), 'instance', 'cravt.db')

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(order)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'delivery_address' not in columns:
            print("Adding 'delivery_address' column to 'order' table...")
            cursor.execute("ALTER TABLE `order` ADD COLUMN delivery_address TEXT")
            print("Column added successfully.")
        else:
            print("'delivery_address' column already exists.")
            
        conn.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
