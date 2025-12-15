import sqlite3
import os

# Define database path
DB_PATH = os.path.join('instance', 'db.sqlite3')

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(`order`)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'acceptance_status' not in columns:
            print("Adding 'acceptance_status' column to 'order' table...")
            # Add the column with a default value of 'pending'
            cursor.execute("ALTER TABLE `order` ADD COLUMN acceptance_status VARCHAR(50) DEFAULT 'pending'")
            conn.commit()
            print("Migration successful: 'acceptance_status' column added.")
        else:
            print("'acceptance_status' column already exists.")

    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
