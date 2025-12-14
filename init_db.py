from app import app, db
from backend.security import user_datastore

with app.app_context():
    db.create_all()
    
    # Create default roles if they don't exist
    if not user_datastore.find_role('customer'):
        user_datastore.create_role(name='customer', description='Customer Role')
    if not user_datastore.find_role('owner'):
        user_datastore.create_role(name='owner', description='Restaurant Owner Role')
    if not user_datastore.find_role('admin'):
        user_datastore.create_role(name='admin', description='Administrator Role')
        
    db.session.commit()
    print("Database tables created and Roles seeded successfully!")
