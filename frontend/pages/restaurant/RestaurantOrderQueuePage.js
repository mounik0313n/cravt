import apiService from '../../utils/apiService.js';

const RestaurantOrderQueuePage = {
    template: `
        <div class="container-fluid py-5 bg-gradient-light">
            <!-- Header Section -->
            <div class="d-flex justify-content-between align-items-center mb-5 fade-in">
                <div>
                    <h2 class="display-5 font-weight-bold text-dark mb-1">Live Order Queue</h2>
                    <p class="text-muted mb-0">Real-time management of incoming orders.</p>
                </div>
                <div class="d-flex align-items-center">
                    <span v-if="loading" class="text-muted mr-3 small"><i class="fas fa-sync fa-spin mr-1"></i> Syncing...</span>
                    <!-- Auto-refresh toggle or indicator could go here -->
                </div>
            </div>

            <div v-if="error" class="alert alert-danger shadow-sm border-0 rounded-lg">{{ error }}</div>

            <div class="row">

                <!-- 1. NEW ORDERS COLUMN -->
                <div class="col-lg-4 mb-4">
                    <div class="queue-column bg-light-blue rounded-xl p-3 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-4 px-2">
                            <h5 class="font-weight-bold mb-0 text-primary">New Orders</h5>
                            <span class="badge badge-pill badge-white text-primary shadow-sm">{{ newOrders.length }}</span>
                        </div>

                        <div v-if="loading && newOrders.length === 0" class="text-center py-5">
                            <div class="spinner-border text-primary spinner-sm" role="status"></div>
                        </div>

                        <div v-if="!loading && newOrders.length === 0" class="empty-state text-center py-5 px-3">
                             <div class="icon-circle bg-white text-muted mb-3 mx-auto shadow-sm">
                                <i class="fas fa-bell-slash fa-lg"></i>
                            </div>
                            <p class="text-muted small mb-0">No pending orders</p>
                        </div>

                        <transition-group name="list" tag="div">
                            <div v-for="order in newOrders" :key="order.id" class="card card-glass border-0 shadow-sm mb-3 order-card">
                                <div class="card-body p-3">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge badge-light-primary text-primary font-weight-bold">#{{ order.id }}</span>
                                        <small class="text-muted">{{ order.createdAt }}</small>
                                    </div>
                                    <h6 class="font-weight-bold text-dark mb-1">{{ order.customerName }}</h6>
                                    
                                     <!-- Order Type & Schedule Badges -->
                                    <div class="mb-3">
                                        <span class="badge badge-pill mr-1" :class="order.order_type === 'dine_in' ? 'badge-info' : 'badge-warning'">
                                            <i :class="order.order_type === 'dine_in' ? 'fas fa-utensils' : 'fas fa-shopping-bag'"></i>
                                            {{ order.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway' }}
                                        </span>
                                        <span v-if="order.is_scheduled" class="badge badge-pill badge-secondary">
                                            <i class="fas fa-clock"></i> {{ order.scheduled_time }}
                                        </span>
                                    </div>

                                    <div class="order-items bg-light rounded p-2 mb-3">
                                        <ul class="list-unstyled mb-0 small">
                                            <li v-for="(item, idx) in order.items" :key="idx" class="d-flex justify-content-between mb-1">
                                                <span><span class="font-weight-bold text-dark mr-2">{{ item.quantity }}x</span> {{ item.name }}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div class="d-flex">
                                        <button class="btn btn-brand btn-sm btn-block shadow-sm mr-2" @click="updateStatus(order.id, 'preparing')">
                                            Accept
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm shadow-sm" @click="updateStatus(order.id, 'rejected')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </transition-group>
                    </div>
                </div>

                <!-- 2. PREPARING COLUMN -->
                <div class="col-lg-4 mb-4">
                     <div class="queue-column bg-light-warning rounded-xl p-3 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-4 px-2">
                            <h5 class="font-weight-bold mb-0 text-orange">Preparing</h5>
                            <span class="badge badge-pill badge-white text-orange shadow-sm">{{ preparingOrders.length }}</span>
                        </div>

                         <div v-if="!loading && preparingOrders.length === 0" class="empty-state text-center py-5 px-3">
                             <div class="icon-circle bg-white text-muted mb-3 mx-auto shadow-sm">
                                <i class="fas fa-fire-alt fa-lg"></i>
                            </div>
                            <p class="text-muted small mb-0">Kitchen is clear</p>
                        </div>

                        <transition-group name="list" tag="div">
                             <div v-for="order in preparingOrders" :key="order.id" class="card card-glass border-0 shadow-sm mb-3 order-card">
                                <div class="card-body p-3">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge badge-light-warning text-orange font-weight-bold">#{{ order.id }}</span>
                                        <small class="text-muted">{{ order.createdAt }}</small>
                                    </div>
                                    <h6 class="font-weight-bold text-dark mb-1">{{ order.customerName }}</h6>
                                    
                                    <div class="mb-3">
                                         <span class="badge badge-pill mr-1" :class="order.order_type === 'dine_in' ? 'badge-info' : 'badge-warning'">
                                            {{ order.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway' }}
                                        </span>
                                    </div>

                                    <div class="order-items bg-light rounded p-2 mb-3">
                                        <ul class="list-unstyled mb-0 small">
                                            <li v-for="(item, idx) in order.items" :key="idx" class="d-flex justify-content-between mb-1">
                                                <span><span class="font-weight-bold text-dark mr-2">{{ item.quantity }}x</span> {{ item.name }}</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <button class="btn btn-warning text-white btn-sm btn-block shadow-sm" @click="updateStatus(order.id, 'ready')">
                                        Mark as Ready <i class="fas fa-check ml-1"></i>
                                    </button>
                                </div>
                            </div>
                        </transition-group>
                    </div>
                </div>

                <!-- 3. READY COLUMN (With OTP) -->
                <div class="col-lg-4 mb-4">
                     <div class="queue-column bg-light-success rounded-xl p-3 h-100">
                        <div class="d-flex justify-content-between align-items-center mb-4 px-2">
                            <h5 class="font-weight-bold mb-0 text-success">Ready for Pickup</h5>
                            <span class="badge badge-pill badge-white text-success shadow-sm">{{ readyOrders.length }}</span>
                        </div>

                         <div v-if="!loading && readyOrders.length === 0" class="empty-state text-center py-5 px-3">
                             <div class="icon-circle bg-white text-muted mb-3 mx-auto shadow-sm">
                                <i class="fas fa-check-circle fa-lg"></i>
                            </div>
                            <p class="text-muted small mb-0">Nothing to serve</p>
                        </div>

                        <transition-group name="list" tag="div">
                             <div v-for="order in readyOrders" :key="order.id" class="card card-glass border-0 shadow-sm mb-3 order-card">
                                <div class="card-body p-3">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <span class="badge badge-light-success text-success font-weight-bold">#{{ order.id }}</span>
                                        <small class="text-muted">{{ order.createdAt }}</small>
                                    </div>
                                    <h6 class="font-weight-bold text-dark mb-1">{{ order.customerName }}</h6>
                                    
                                     <div class="mb-3">
                                         <span class="badge badge-pill mr-1" :class="order.order_type === 'dine_in' ? 'badge-info' : 'badge-warning'">
                                            {{ order.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway' }}
                                        </span>
                                    </div>

                                    <div class="bg-white rounded border border-light p-3 mt-3">
                                        <label class="small font-weight-bold text-muted text-uppercase mb-2">Verify Customer OTP</label>
                                        <div class="input-group input-group-sm">
                                            <input type="text" 
                                                   class="form-control border-right-0" 
                                                   v-model="otpInputs[order.id]" 
                                                   placeholder="6-digit OTP" 
                                                   maxlength="6"
                                                   @keyup.enter="verifyOrder(order.id)">
                                            <div class="input-group-append">
                                                <button class="btn btn-success" @click="verifyOrder(order.id)">
                                                    Verify
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </transition-group>
                    </div>
                </div>

            </div>
        </div>
    `,
    data() {
        return {
            loading: true,
            error: null,
            orders: [],
            intervalId: null,
            otpInputs: {},
        };
    },
    computed: {
        newOrders() { return this.orders.filter(o => o.status === 'placed'); },
        preparingOrders() { return this.orders.filter(o => o.status === 'preparing'); },
        readyOrders() { return this.orders.filter(o => o.status === 'ready'); }
    },
    mounted() {
        this.fetchOrders();
        this.intervalId = setInterval(this.fetchOrders, 30000); // Poll every 30s
    },
    beforeDestroy() {
        if (this.intervalId) clearInterval(this.intervalId);
    },
    methods: {
        async fetchOrders() {
            // Background refresh shouldn't trigger full page loader if data exists
            if (this.orders.length === 0) this.loading = true;

            try {
                const data = await apiService.get('/api/restaurant/orders');
                this.orders = data;

                // Initialize OTP inputs for new ready orders
                this.orders.forEach(order => {
                    if (order.status === 'ready' && !this.otpInputs.hasOwnProperty(order.id)) {
                        this.$set(this.otpInputs, order.id, '');
                    }
                });
            } catch (err) {
                console.error("Order sync failed", err);
                if (this.orders.length === 0) this.error = "Failed to load orders.";
            } finally {
                this.loading = false;
            }
        },
        async updateStatus(orderId, newStatus) {
            if (newStatus === 'rejected' && !confirm('Are you sure you want to reject this order?')) {
                return;
            }
            try {
                await apiService.patch(`/api/restaurant/orders/${orderId}/status`, { status: newStatus });
                // Optimistic update could go here, but re-fetching is safer
                this.fetchOrders();
            } catch (err) {
                alert('Action failed: ' + err.message);
            }
        },
        async verifyOrder(orderId) {
            const otp = this.otpInputs[orderId];
            if (!otp || otp.length !== 6) {
                alert('Please enter a valid 6-digit OTP.');
                return;
            }
            try {
                const res = await apiService.post(`/api/restaurant/orders/${orderId}/verify`, { otp });
                alert(res.message);
                this.fetchOrders();
            } catch (err) {
                alert('Verification failed: ' + err.message);
            }
        }
    }
};

export default RestaurantOrderQueuePage;