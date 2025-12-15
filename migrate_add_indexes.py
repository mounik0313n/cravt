# Migration script to add database indexes for performance
import sqlite3
import os

# Use the correct database path
DB_PATH = os.path.join('instance', 'db.sqlite3')

def add_indexes():
    """Add indexes to improve query performance"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        print("Adding indexes to improve performance...")
        
        # Order table indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_user_id ON "order"(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_restaurant_id ON "order"(restaurant_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_status ON "order"(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_created_at ON "order"(created_at)')
        
        # Restaurant table indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_restaurant_city ON restaurant(city)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_restaurant_is_active ON restaurant(is_active)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_restaurant_owner_id ON restaurant(owner_id)')
        
        # MenuItem table indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_menuitem_restaurant_id ON menu_item(restaurant_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_menuitem_is_available ON menu_item(is_available)')
        
        # Review table indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_review_restaurant_id ON review(restaurant_id)')
        
        conn.commit()
        print("✅ Indexes added successfully!")
        
    except sqlite3.Error as e:
        print(f"❌ Error adding indexes: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at {DB_PATH}")
        print("Please ensure the database exists before running this migration.")
    else:
        add_indexes()
