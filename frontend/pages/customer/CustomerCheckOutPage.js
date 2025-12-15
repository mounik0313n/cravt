import apiService from '../../utils/apiService.js';
import store from '../../utils/store.js'; // Ensure store is imported if referenced directly in template/scripts

const CustomerCheckoutPage = {
    template: `
        <div class="container my-5">
            <h2 class="text-center mb-5 font-weight-bold">Finalize Your <span class="text-brand">Order</span></h2>
            <div class="row">
                <div class="col-lg-7">
                    <!-- 1. Order Type Selection -->
                    <div class="card card-glass mb-4 border-0">
                        <div class="card-body p-4">
                            <h5 class="card-title font-weight-bold mb-4">1. Choose Order Type</h5>
                            <div class="row">
                                <div class="col-4 px-1">
                                    <label class="btn btn-outline-brand w-100 shadow-sm p-2" :class="{ active: orderType === 'delivery' }" @click="selectOrderType('delivery')">
                                        <input type="radio" name="orderTypeOptions" value="delivery" autocomplete="off"> 
                                        <div class="text-center">
                                            <i class="fas fa-truck mb-1"></i><br>Delivery
                                        </div>
                                    </label>
                                </div>
                                <div class="col-4 px-1">
                                    <label class="btn btn-outline-brand w-100 shadow-sm p-2" :class="{ active: orderType === 'takeaway' }" @click="selectOrderType('takeaway')">
                                        <input type="radio" name="orderTypeOptions" value="takeaway" autocomplete="off"> 
                                        <div class="text-center">
                                            <i class="fas fa-shopping-bag mb-1"></i><br>Takeaway
                                        </div>
                                    </label>
                                </div>
                                <div class="col-4 px-1">
                                    <label class="btn btn-outline-brand w-100 shadow-sm p-2" :class="{ active: orderType === 'dine_in' }" @click="selectOrderType('dine_in')">
                                        <input type="radio" name="orderTypeOptions" value="dine_in" autocomplete="off"> 
                                        <div class="text-center">
                                            <i class="fas fa-utensils mb-1"></i><br>Dine-In
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Address Input for Delivery -->
                            <div v-if="orderType === 'delivery'" class="mt-4 pt-3 border-top">
                                <label class="font-weight-bold">Delivery Address</label>
                                <textarea class="form-control" v-model="deliveryAddress" rows="2" placeholder="Enter your full delivery address..."></textarea>
                                <small class="text-muted" v-if="!deliveryAddress">Address is required for delivery.</small>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Scheduling -->
                    <div class="card card-glass mb-4 border-0">
                        <div class="card-body p-4">
                            <h5 class="card-title font-weight-bold mb-4">2. Choose When</h5>
                            
                            <div class="form-group mb-4">
                                <div class="btn-group btn-group-toggle d-flex">
                                    <label class="btn btn-outline-secondary w-100 py-3 font-weight-bold" :class="{ active: scheduleChoice === 'now' }" @click="scheduleChoice = 'now'">
                                        <input type="radio" value="now"> ORDER NOW
                                    </label>
                                    <label class="btn btn-outline-secondary w-100 py-3 font-weight-bold" :class="{ active: scheduleChoice === 'later' }" @click="scheduleChoice = 'later'">
                                        <input type="radio" value="later"> SCHEDULE FOR LATER
                                    </label>
                                </div>
                            </div>
                            
                            <div v-if="isScheduling">
                                <p v-if="orderType === 'dine_in'" class="text-muted small mb-3">Reserve a table.</p>
                                <p v-else class="text-muted small mb-3">Schedule your {{ orderType }}.</p>

                                <div v-if="slotsLoading" class="text-muted text-center py-3">
                                    <div class="spinner-border spinner-border-sm text-brand" role="status"></div> Loading...
                                </div>
                                <div v-if="slotsError" class="alert alert-warning">{{ slotsError }}</div>
                                
                                <div v-if="!slotsLoading && availableDays.length > 0" class="form-row">
                                    <div class="form-group col-md-6">
                                        <label for="scheduleDate" class="font-weight-bold">Select Date</label>
                                        <select id="scheduleDate" class="form-control form-control-lg" v-model="selectedDate">
                                            <option v-for="day in availableDays" :key="day.date_value" :value="day.date_value">
                                                {{ day.date_display }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="form-group col-md-6">
                                        <label for="scheduleTime" class="font-weight-bold">Select Time</label>
                                        <select id="scheduleTime" class="form-control form-control-lg" v-model="selectedTime" required>
                                            <option :value="null">-- Pick a Time --</option>
                                            <option v-for="slot in slotsForSelectedDay" :key="slot.value" :value="slot.value">
                                                {{ slot.display }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                                <div v-if="!slotsLoading && availableDays.length === 0" class="alert alert-info">
                                    No slots available for the upcoming days.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. Coupon -->
                    <div class="card card-glass border-0">
                        <div class="card-body p-4">
                            <h5 class="card-title font-weight-bold mb-4">3. Apply Coupon</h5>

                            <div v-if="couponsLoading" class="text-muted small my-3">Checking for deals...</div>
                            <div v-if="!couponsLoading && availableCoupons.length > 0" class="mb-3">
                                <small class="text-muted d-block mb-2 font-weight-bold">BEST DEALS FOR YOU:</small>
                                <div class="d-flex flex-wrap">
                                    <button v-for="coupon in availableCoupons" 
                                            :key="coupon.code" 
                                            class="btn btn-sm btn-outline-success mr-2 mb-2 rounded-pill shadow-sm"
                                            @click="selectAndApplyCoupon(coupon)"
                                            :disabled="!!appliedCoupon">
                                        <i class="fas fa-tag mr-1"></i> {{ coupon.code }}
                                    </button>
                                </div>
                            </div>

                            <div v-if="couponError" class="alert alert-danger">{{ couponError }}</div>
                            <div v-if="appliedCoupon" class="alert alert-success d-flex align-items-center">
                                <i class="fas fa-check-circle mr-2"></i>
                                <span>'{{ appliedCoupon }}' applied! You saved <strong>₹{{ discountAmount.toLocaleString('en-IN') }}</strong></span>
                            </div>
                            <div class="input-group mt-3">
                                <input type="text" class="form-control form-control-lg" v-model="couponCode" placeholder="Enter promo code" :disabled="!!appliedCoupon">
                                <div class="input-group-append">
                                    <button class="btn btn-brand" @click="applyCoupon" :disabled="isApplyingCoupon || !!appliedCoupon">
                                        {{ isApplyingCoupon ? '...' : 'Apply' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="col-lg-5 mt-4 mt-lg-0">
                    <div class="card stat-card card-glass h-100 border-0 sticky-top" style="top: 100px; z-index: 1;">
                        <div class="card-body p-4">
                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                            <h4 class="card-title font-weight-bold mb-4">Order Summary</h4>
                            
                            <ul class="list-group list-group-flush mb-4">
                                <li class="list-group-item d-flex justify-content-between bg-transparent border-bottom-0 pb-1 px-0">
                                    <span class="text-muted">Item Total</span>
                                    <span class="font-weight-medium">₹{{ subtotal.toLocaleString('en-IN') }}</span>
                                </li>
                                <!-- Logic Change: Dynamic Service Fee & Platform Fee -->
                                <li class="list-group-item d-flex justify-content-between bg-transparent border-bottom-0 py-1 px-0">
                                    <span class="text-muted">
                                        {{ orderType === 'delivery' ? 'Delivery Fee' : (orderType === 'takeaway' ? 'Takeaway Fee' : 'Dine-In Fee') }}
                                    </span>
                                    <span class="font-weight-medium">₹{{ deliveryFee.toLocaleString('en-IN') }}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between bg-transparent border-bottom-0 py-1 px-0">
                                    <span class="text-muted">Platform Fee</span>
                                    <span class="font-weight-medium">₹{{ platformFee.toLocaleString('en-IN') }}</span>
                                </li>
                                <li v-if="appliedCoupon" class="list-group-item d-flex justify-content-between bg-transparent border-bottom-0 py-1 px-0 text-success">
                                    <span><i class="fas fa-tag mr-1"></i> Discount</span>
                                    <span>-₹{{ discountAmount.toLocaleString('en-IN') }}</span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between bg-transparent border-top mt-2 pt-3 px-0">
                                    <h5 class="font-weight-bold">To Pay</h5>
                                    <h5 class="font-weight-bold text-brand">₹{{ total.toLocaleString('en-IN') }}</h5>
                                </li>
                            </ul>
                            
                            <button class="btn btn-brand btn-block btn-lg shadow-lg" @click="placeOrder" :disabled="isPlacing || isPaying || (isScheduling && !selectedTime)">
                                <span v-if="isPaying">Processing... <i class="fas fa-spinner fa-spin ml-1"></i></span>
                                <span v-else-if="isPlacing">Placing Order...</span>
                                <span v-else>Place Order <i class="fas fa-arrow-right ml-2"></i></span>
                            </button>
                            <p class="text-center text-muted small mt-3"><i class="fas fa-lock mr-1"></i> Secure Checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            isPlacing: false,
            isPaying: false,
            error: null,
            // Logic: Default fees, overridden by API
            baseDeliveryFee: 50.00,
            takeawayFee: 20.00,
            dineInFee: 10.00,
            platformFeeCost: 7.00,

            restaurantInfo: null, // Store restaurant details

            orderType: 'delivery', // Default to Delivery now as per standard
            scheduleChoice: 'now',
            slotsLoading: false,
            slotsError: null,
            availableDays: [],
            selectedDate: null,
            selectedTime: null,
            isApplyingCoupon: false,
            couponCode: '',
            couponError: null,
            appliedCoupon: null,
            discountAmount: 0,
            availableCoupons: [],
            couponsLoading: true,
            deliveryAddress: (store.getters.currentUser && store.getters.currentUser.address) ? store.getters.currentUser.address : '',
            currentOrderId: null // Track order ID for retries
        };
    },
    computed: {
        cartItems() { return store.getters.cartItems; },
        cartTotal() { return store.getters.cartTotal; },
        cartRestaurantId() { return store.getters.cartRestaurantId; },
        subtotal() {
            return this.cartTotal;
        },
        deliveryFee() {
            // Priority: API Value -> Logic Fallback -> Default
            let fee = 0;
            if (this.orderType === 'delivery') {
                fee = this.restaurantInfo && this.restaurantInfo.delivery_fee != null
                    ? this.restaurantInfo.delivery_fee
                    : this.baseDeliveryFee;
            } else if (this.orderType === 'takeaway') {
                fee = this.restaurantInfo && this.restaurantInfo.takeaway_fee != null
                    ? this.restaurantInfo.takeaway_fee
                    : this.takeawayFee;
            } else if (this.orderType === 'dine_in') {
                fee = this.restaurantInfo && this.restaurantInfo.dine_in_fee != null
                    ? this.restaurantInfo.dine_in_fee
                    : this.dineInFee;
            }
            return fee;
        },
        platformFee() {
            // Dynamic Platform Fee
            if (this.restaurantInfo && this.restaurantInfo.platform_fee != null) {
                return this.restaurantInfo.platform_fee;
            }
            return this.platformFeeCost;
        },
        total() {
            // Total = Subtotal + Fees - Discount
            return Math.max(0, this.subtotal + this.deliveryFee + this.platformFee - this.discountAmount);
        },
        isScheduling() {
            return this.orderType === 'dine_in' || this.scheduleChoice === 'later';
        },
        slotsForSelectedDay() {
            if (!this.selectedDate) return [];
            const day = this.availableDays.find(d => d.date_value === this.selectedDate);
            return day ? day.slots : [];
        }
    },
    watch: {
        isScheduling(newVal) {
            if (newVal) {
                this.fetchAvailableSlots();
            } else {
                this.selectedDate = null;
                this.selectedTime = null;
            }
        },
        selectedDate() {
            this.selectedTime = null;
        }
    },
    mounted() {
        if (this.isScheduling) {
            this.fetchAvailableSlots();
        }
        this.fetchApplicableCoupons();
        this.fetchRestaurantDetails(); // Fetch fee config
    },
    methods: {
        async fetchRestaurantDetails() {
            if (!this.cartRestaurantId) return;
            try {
                const data = await apiService.get(`/api/restaurants/${this.cartRestaurantId}`);
                console.log("DEBUG: Fetched Restaurant Details:", data); // ✅ DEBUG LOG
                this.restaurantInfo = data;
                // Update local defaults if needed, but computed properties handle it
            } catch (e) {
                console.warn("Could not fetch restaurant specific fees, using defaults.", e);
            }
        },
        selectOrderType(type) {
            this.orderType = type;
            this.selectedDate = null;
            this.selectedTime = null;
            this.appliedCoupon = null;
            this.discountAmount = 0;
            this.availableDays = [];
        },
        async fetchAvailableSlots() {
            if (!this.isScheduling) return;

            this.slotsLoading = true;
            this.slotsError = null;
            try {
                // apiService.get shortcut
                const data = await apiService.get(`/api/restaurants/${this.cartRestaurantId}/available-slots`);
                this.availableDays = data || [];

                if (this.availableDays.length > 0 && !this.selectedDate) {
                    this.selectedDate = this.availableDays[0].date_value;
                }
            } catch (err) {
                console.error('Failed to fetch slots', err);
                this.slotsError = 'Failed to load available slots. Please try again.';
            } finally {
                this.slotsLoading = false;
            }
        },
        async fetchApplicableCoupons() {
            if (!this.cartRestaurantId) return;
            this.couponsLoading = true;
            try {
                this.availableCoupons = await apiService.get(`/api/coupons/applicable/${this.cartRestaurantId}`);
            } catch (err) {
                console.error('Failed to fetch coupons:', err.message);
            } finally {
                this.couponsLoading = false;
            }
        },
        formatCouponDeal(coupon) {
            if (coupon.discount_type === 'Percentage') {
                return `${coupon.discount_value}% OFF`;
            }
            return `₹${coupon.discount_value} OFF`;
        },
        selectAndApplyCoupon(coupon) {
            this.couponCode = coupon.code;
            this.applyCoupon();
        },
        async applyCoupon() {
            if (!this.couponCode) {
                this.couponError = "Please enter a coupon code.";
                return;
            }
            this.isApplyingCoupon = true;
            this.couponError = null;
            try {
                const data = await apiService.post('/api/coupons/apply', {
                    code: this.couponCode,
                    subtotal: this.subtotal,
                    restaurant_id: this.cartRestaurantId
                });
                this.discountAmount = data.discount;
                this.appliedCoupon = this.couponCode;
            } catch (err) {
                this.couponError = err.message;
            } finally {
                this.isApplyingCoupon = false;
            }
        },
        loadRazorpayScript() {
            return new Promise((resolve, reject) => {
                if (window.Razorpay) return resolve(true);
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
                document.body.appendChild(script);
            });
        },
        async payWithRazorpay(orderId) {
            try {
                this.isPaying = true;
                const res = await apiService.post('/api/payments/create', { order_id: orderId });
                const { razorpay_order_id, razorpay_key, amount } = res;

                try {
                    await this.loadRazorpayScript();

                    const options = {
                        key: razorpay_key,
                        amount: amount,
                        currency: 'INR',
                        name: 'Cravt',
                        description: `Order #\${orderId}`,
                        order_id: razorpay_order_id,
                        handler: async (response) => {
                            this.isPaying = false;
                            try {
                                const verify = await apiService.post('/api/payments/verify', {
                                    order_id: orderId,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature
                                });

                                this.$store.dispatch('clearCart');
                                alert('Payment successful!');
                                // Clear the current order tracking so next time we start fresh
                                this.currentOrderId = null;
                                this.$router.push({ name: 'OrderDetail', params: { id: orderId } });
                            } catch (verErr) {
                                console.error('Verification failed', verErr);
                                alert('Payment succeeded but verification failed. Contact support.');
                                this.$router.push({ name: 'OrderDetail', params: { id: orderId } });
                            }
                        },
                        prefill: {
                            name: (store.getters.currentUser) ? (store.getters.currentUser.name || '') : '',
                            email: (store.getters.currentUser) ? (store.getters.currentUser.email || '') : '',
                            contact: (store.getters.currentUser) ? (store.getters.currentUser.phone || '') : ''
                        },
                        theme: { color: '#F8941C' },
                        modal: {
                            ondismiss: () => {
                                this.isPaying = false;
                                console.log('Payment cancelled by user.');
                                alert('Payment cancelled. You can retry payment for this order.');
                            }
                        }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', (resp) => {
                        this.isPaying = false;
                        console.error('Payment failed', resp);
                        alert('Payment failed: ' + (resp.error.description || 'Unknown error'));
                    });
                    rzp.open();

                } catch (razorpayLoadError) {
                    console.log('Razorpay SDK error/dev mode', razorpayLoadError);
                    // Mock payment logic for dev
                    this.isPaying = false;
                    const verify = await apiService.post('/api/payments/verify', {
                        order_id: orderId,
                        razorpay_order_id: razorpay_order_id,
                        razorpay_payment_id: 'pay_mock_' + Date.now(),
                        razorpay_signature: 'mock_sig'
                    });
                    this.$store.dispatch('clearCart');
                    alert('Payment successful (Dev Mode)!');
                    this.currentOrderId = null;
                    this.$router.push({ name: 'OrderDetail', params: { id: orderId } });
                }

            } catch (e) {
                this.isPaying = false;
                console.error('Payment error:', e);
                alert('Unable to start payment: ' + (e.message || e));
            }
        },
        async placeOrder() {
            this.isPlacing = true;
            this.error = null;

            if (this.isScheduling && !this.selectedTime) {
                this.error = "Please select a time slot for your scheduled order.";
                this.isPlacing = false;
                return;
            }

            if (this.orderType === 'delivery' && !this.deliveryAddress) {
                this.error = "Please provide a delivery address.";
                this.isPlacing = false;
                return;
            }

            // ✅ FIX: Check if we already have an order ID for this session (retry scenario)
            if (this.currentOrderId) {
                console.log("Retrying payment for existing order:", this.currentOrderId);
                await this.payWithRazorpay(this.currentOrderId);
                this.isPlacing = false;
                return;
            }

            let payload = {
                restaurant_id: this.cartRestaurantId,
                order_type: this.orderType,
                items: this.cartItems.map(item => ({ menu_item_id: item.id, quantity: item.quantity })),
                coupon_code: this.appliedCoupon,
                scheduled_time: this.selectedTime,
                delivery_address: this.deliveryAddress
            };

            try {
                const data = await apiService.post('/api/orders', payload);
                const orderId = data.order_id;
                // ✅ FIX: Store the order ID so we don't create it again if payment fails
                this.currentOrderId = orderId;
                await this.payWithRazorpay(orderId);
            } catch (err) {
                this.error = err.message || "Failed to place order.";
            } finally {
                this.isPlacing = false;
            }
        }
    }
};

export default CustomerCheckoutPage;
