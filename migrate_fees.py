
from app import app, db
from sqlalchemy import text

def add_column_if_not_exists(table, column, type_def):
    with app.app_context():
        # Check if column exists
        check_query = text(f"PRAGMA table_info({table})")
        result = db.session.execute(check_query)
        columns = [row[1] for row in result]
        
        if column not in columns:
            print(f"Adding column {column} to {table}...")
            try:
                # SQLite has limited ALTER TABLE support, but adding columns is widely supported
                db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}"))
                db.session.commit()
                print(f"✅ Added {column}")
            except Exception as e:
                print(f"❌ Failed to add {column}: {e}")
                db.session.rollback()
        else:
            print(f"ℹ️ Column {column} already exists in {table}.")

if __name__ == "__main__":
    print("Starting schema migration...")
    add_column_if_not_exists("restaurant", "delivery_fee", "FLOAT DEFAULT 50.0")
    add_column_if_not_exists("restaurant", "takeaway_fee", "FLOAT DEFAULT 20.0")
    add_column_if_not_exists("restaurant", "dine_in_fee", "FLOAT DEFAULT 10.0")
    add_column_if_not_exists("restaurant", "platform_fee", "FLOAT DEFAULT 7.0")
    print("Migration complete.")
