import random
import string
from flask_restful import Resource, reqparse, fields, marshal_with
from flask_security import auth_required, current_user
from .models import db, User, Restaurant, MenuItem, Category, Order, OrderItem, Coupon
from datetime import datetime

# ... (user_fields, menu_item_fields, etc. are unchanged) ...
user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'name': fields.String,
}

menu_item_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'price': fields.Float,
    'is_available': fields.Boolean
}

category_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'menu_items': fields.List(fields.Nested(menu_item_fields))
}

restaurant_list_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'address': fields.String,
    'city': fields.String
}

restaurant_detail_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'address': fields.String,
    'city': fields.String,
    'owner': fields.Nested(user_fields),
    'categories': fields.List(fields.Nested(category_fields)),
    # --- Fee Fields ---
    'delivery_fee': fields.Float,
    'takeaway_fee': fields.Float,
    'dine_in_fee': fields.Float,
    'platform_fee': fields.Float
}

order_item_fields = {
    'menu_item_name': fields.String(attribute='menu_item.name'),
    'quantity': fields.Integer,
    'price_at_order': fields.Float
}

order_fields = {
    'id': fields.Integer,
    'total_amount': fields.Float,
    'status': fields.String,
    'created_at': fields.DateTime,
    'restaurant_name': fields.String(attribute='restaurant.name'),
    'items': fields.List(fields.Nested(order_item_fields))
}


# --- Request Parsers for Input Validation ---

order_parser = reqparse.RequestParser()
order_parser.add_argument('restaurant_id', type=int, required=True, help='Restaurant ID is required')
order_parser.add_argument('order_type', type=str, required=True, choices=('delivery', 'takeaway', 'dine_in'), help='Order type is required')
order_parser.add_argument('items', type=list, location='json', required=True, help='Order items are required')
# ✅ MODIFIED: Added optional arguments for scheduling and coupons
order_parser.add_argument('coupon_code', type=str, location='json')
order_parser.add_argument('is_scheduled', type=bool, location='json', default=False)
order_parser.add_argument('is_scheduled', type=bool, location='json', default=False)
order_parser.add_argument('scheduled_time', type=str, location='json')
order_parser.add_argument('delivery_address', type=str, location='json')


# --- API Resource Classes ---

class RestaurantListAPI(Resource):
    @auth_required('token')
    @marshal_with(restaurant_list_fields)
    def get(self):
        """ Returns a list of all verified and active restaurants """
        restaurants = Restaurant.query.filter_by(is_verified=True, is_active=True).all()
        return restaurants

class RestaurantAPI(Resource):
    @auth_required('token')
    @marshal_with(restaurant_detail_fields)
    def get(self, restaurant_id):
        """ Returns details of a specific restaurant, including its menu """
        restaurant = Restaurant.query.get_or_404(restaurant_id)
        return restaurant

class OrderAPI(Resource):
    @auth_required('token')
    def get(self):
        """ Returns the order history for the current user """
        orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
        from flask_restful import marshal
        return marshal(orders, order_fields)

    @auth_required('token')
    def post(self):
        """ Places a new order for the current user """
        args = order_parser.parse_args()
        
        restaurant = Restaurant.query.get_or_404(args['restaurant_id'])
        
        total_amount = 0
        order_items_to_create = []

        for item_data in args['items']:
            menu_item = MenuItem.query.get(item_data['menu_item_id'])
            if not menu_item or not menu_item.is_available or menu_item.restaurant_id != restaurant.id:
                return {'message': f"Menu item with id {item_data['menu_item_id']} is invalid or unavailable"}, 400
            
            quantity = item_data['quantity']
            total_amount += menu_item.price * quantity
            
            order_items_to_create.append(OrderItem(
                menu_item_id=menu_item.id,
                quantity=quantity,
                price_at_order=menu_item.price
            ))

        if not order_items_to_create:
            return {'message': 'Order must contain at least one item'}, 400

        # --- ✅ START: UPDATED FEE LOGIC (DYNAMIC) ---
        # 1. Platform Fee (From Restaurant Config)
        platform_fee = restaurant.platform_fee if restaurant.platform_fee is not None else 7.0
        
        # 2. Service/Order Type Fee (From Restaurant Config)
        service_fee = 0.0
        if args['order_type'] == 'delivery':
            service_fee = restaurant.delivery_fee if restaurant.delivery_fee is not None else 50.0
        elif args['order_type'] == 'takeaway':
             service_fee = restaurant.takeaway_fee if restaurant.takeaway_fee is not None else 20.0
        elif args['order_type'] == 'dine_in':
             service_fee = restaurant.dine_in_fee if restaurant.dine_in_fee is not None else 10.0
        
        # Base total before discount
        gross_total = total_amount + platform_fee + service_fee
        
        final_amount = gross_total
        discount_amount = 0
        coupon_id = None

        if args['coupon_code']:
            coupon = Coupon.query.filter_by(code=args['coupon_code'], is_active=True).first()
            if coupon and (coupon.restaurant_id is None or coupon.restaurant_id == restaurant.id):
                coupon_id = coupon.id
                if coupon.discount_type == 'Percentage':
                    discount_amount = (total_amount * coupon.discount_value) / 100 # Discount usually applies to item total only
                elif coupon.discount_type == 'Fixed':
                    discount_amount = coupon.discount_value
                
                # Ensure we don't drop below 0
                final_amount = max(0, gross_total - discount_amount)
            else:
                return {'message': 'Invalid or expired coupon code.'}, 400
        # --- ✅ END: UPDATED FEE LOGIC ---

        # Create the base order object
        new_order_data = {
            'user_id': current_user.id,
            'restaurant_id': restaurant.id,
            'total_amount': round(final_amount, 2),
            'order_type': args['order_type'],
            'otp': ''.join(random.choices(string.digits, k=6)),
            'qr_payload': ''.join(random.choices(string.ascii_letters + string.digits, k=20)),
            'items': order_items_to_create,
            'coupon_id': coupon_id,
            'discount_amount': round(discount_amount, 2),
            'delivery_address': args.get('delivery_address')
        }

        # Add scheduling info only if the order is scheduled
        if args['is_scheduled'] and args['scheduled_time']:
            try:
                # Expecting ISO format from frontend (e.g., "2025-10-13T14:30:00.000Z")
                new_order_data['is_scheduled'] = True
                new_order_data['scheduled_time'] = datetime.fromisoformat(args['scheduled_time'].replace('Z', '+00:00'))
            except (ValueError, TypeError):
                return {'message': 'Invalid scheduled time format.'}, 400
        # --- ✅ END: MODIFIED LOGIC ---

        new_order = Order(**new_order_data)
        db.session.add(new_order)
        db.session.commit()

        return {'message': 'Order placed successfully', 'order_id': new_order.id}, 201

