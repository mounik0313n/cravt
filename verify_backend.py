import requests
import json
import random
import string

BASE_URL = "http://localhost:10000"

def random_string(length=10):
    return ''.join(random.choices(string.ascii_letters, k=length))

def random_email():
    return f"{random_string()}@example.com"

def test_backend():
    print("--- Starting Backend Verification ---")
    
    # 1. Register a Restaurant Owner
    owner_email = random_email()
    owner_password = "password123"
    restaurant_name = f"Test Resto {random_string(5)}"
    
    print(f"\n1. Registering Restaurant: {restaurant_name} ({owner_email})")
    reg_payload = {
        "ownerEmail": owner_email,
        "password": owner_password,
        "ownerName": "Test Owner",
        "restaurantName": restaurant_name,
        "address": "123 Test St",
        "city": "Test City",
        "latitude": 12.9716, # Bangalore coords
        "longitude": 77.5946
    }
    
    try:
        res = requests.post(f"{BASE_URL}/api/restaurant/register", json=reg_payload)
        print(f"   Response: {res.status_code} - {res.text}")
        if res.status_code != 201:
            print("   [FAILED] Registration failed.")
            return
    except Exception as e:
        print(f"   [FAILED] Connection error: {e}")
        return

    # 2. Login as Owner
    print(f"\n2. Logging in as Owner")
    login_payload = {"email": owner_email, "password": owner_password}
    res = requests.post(f"{BASE_URL}/api/login", json=login_payload)
    print(f"   Response: {res.status_code}")
    
    if res.status_code != 200:
        print("   [FAILED] Login failed.")
        return
        
    token = res.json().get('token')
    headers = {"Authentication-Token": token}
    print("   [SUCCESS] Logged in.")

    # 3. Test Dashboard (which was broken)
    print(f"\n3. Testing Dashboard Endpoint (GET /api/restaurant/dashboard)")
    res = requests.get(f"{BASE_URL}/api/restaurant/dashboard", headers=headers)
    print(f"   Response: {res.status_code}")
    if res.status_code == 200:
        print("   [SUCCESS] Dashboard loaded.")
        print(f"   Stats: {json.dumps(res.json().get('stats'), indent=2)}")
    else:
        print(f"   [FAILED] Dashboard error: {res.text}")

    # 4. Test Fees (new endpoint)
    print(f"\n4. Testing Fees Endpoint (GET /api/restaurant/fees)")
    res = requests.get(f"{BASE_URL}/api/restaurant/fees", headers=headers)
    print(f"   Response: {res.status_code}")
    if res.status_code == 200:
        print("   [SUCCESS] Fees loaded.")
        print(f"   Fees: {json.dumps(res.json(), indent=2)}")
    else:
        print(f"   [FAILED] Fees error: {res.text}")

    # 5. Verify Restaurant (Admin usually does this, making it verified for Geoloc test)
    # We can't easily switch to admin user without knowing admin creds.
    # However, we can check if Geolocation works for ANY restaurant.
    # We rely on existing data or the one we just made (if auto-verified? No, it's pending).
    
    # Let's try to query nearby restaurants.
    print(f"\n5. Testing Nearby Restaurants (GET /api/restaurants/nearby)")
    # Using the same coords we registered with
    res = requests.get(f"{BASE_URL}/api/restaurants/nearby?lat=12.9716&lng=77.5946")
    print(f"   Response: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"   [SUCCESS] Nearby API operational. Found {len(data)} restaurants.")
    else:
        print(f"   [FAILED] Nearby API error: {res.text}")

    # 6. Test Featured Restaurants
    print(f"\n6. Testing Featured Restaurants (GET /api/restaurants/featured)")
    res = requests.get(f"{BASE_URL}/api/restaurants/featured")
    print(f"   Response: {res.status_code}")
    if res.status_code == 200:
        print(f"   [SUCCESS] Featured API operational. Found {len(res.json())} restaurants.")
    else:
        print(f"   [FAILED] Featured API error: {res.text}")

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    test_backend()
