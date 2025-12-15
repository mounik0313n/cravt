const CustomerOrderDetailPage = {
    template: `
        <div class="container my-5">
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-brand" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Loading your order details...</p>
            </div>
            <div v-if="error" class="alert alert-danger shadow-sm border-0 rounded-lg">{{ error }}</div>
            
            <div v-if="order && !loading" class="fade-in">
                <div class="text-center mb-5">
                    <h2 class="font-weight-bold">Order Details</h2>
                    <p class="text-muted">Reference ID <span class="badge badge-light shadow-sm text-dark font-weight-bold ml-2">#{{ order.id }}</span></p>
                </div>
                
                <div class="row">
                    <div class="col-lg-7">
                        <!-- Order Summary Card -->
                        <div class="card card-glass border-0 mb-4 shadow-sm">
                            <div class="card-body p-4">
                                <h4 class="card-title font-weight-bold mb-4">Summary</h4>
                                <ul class="list-unstyled">
                                    <li class="d-flex justify-content-between py-3 border-bottom-light">
                                        <span class="text-muted"><i class="far fa-calendar-alt mr-2 text-brand"></i>Order Date</span>
                                        <span class="font-weight-medium">{{ order.date }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-3 border-bottom-light">
                                        <span class="text-muted"><i class="fas fa-store mr-2 text-brand"></i>Restaurant</span>
                                        <span class="font-weight-medium">{{ order.restaurantName }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-3 border-bottom-light">
                                        <span class="text-muted"><i class="fas fa-utensils mr-2 text-brand"></i>Type</span>
                                        <span class="badge badge-pill badge-warning text-white px-3 py-2">{{ order.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway' }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-3 border-bottom-light">
                                        <span class="text-muted"><i class="fas fa-receipt mr-2 text-brand"></i>Total Amount</span>
                                        <h4 class="font-weight-bold text-brand mb-0">₹{{ order.total.toLocaleString('en-IN') }}</h4>
                                    </li>
                                    <!-- ✅ ADDED: Transaction ID -->
                                    <li v-if="order.razorpay_payment_id" class="d-flex justify-content-between py-3 border-bottom-light">
                                        <span class="text-muted"><i class="fas fa-credit-card mr-2 text-brand"></i>Transaction ID</span>
                                        <span class="font-weight-medium small text-dark">{{ order.razorpay_payment_id.split('_')[1] || order.razorpay_payment_id }}</span>
                                    </li>
                                    <li class="d-flex justify-content-between py-3 align-items-center">
                                        <span class="text-muted"><i class="fas fa-info-circle mr-2 text-brand"></i>Status</span>
                                        <span class="status-badge px-3 py-1 rounded-pill" :class="order.status.toLowerCase()">{{ order.status }}</span>
                                    </li>

                                    <li v-if="order.is_scheduled && order.scheduled_date" class="mt-3 p-3 bg-light-brand rounded d-flex align-items-center">
                                        <i class="fas fa-clock fa-lg text-brand mr-3"></i>
                                        <div>
                                            <span class="d-block text-muted small font-weight-bold text-uppercase">Scheduled For</span>
                                            <strong class="text-dark">{{ order.scheduled_date }} at {{ order.scheduled_time }}</strong>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Items Card -->
                        <div class="card card-glass border-0 shadow-sm">
                            <div class="card-body p-4">
                                <h4 class="card-title font-weight-bold mb-4">Items Ordered</h4>
                                <ul class="list-group list-group-flush">
                                    <li v-for="item in order.items" :key="item.id" class="list-group-item bg-transparent border-bottom-light d-flex justify-content-between align-items-center px-0 py-3">
                                        <div class="d-flex align-items-center">
                                            <span class="badge badge-light border mr-3">{{ item.quantity }}x</span>
                                            <span class="font-weight-medium">{{ item.name }}</span>
                                        </div>
                                        <strong>₹{{ (item.price * item.quantity).toLocaleString('en-IN') }}</strong>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Verification Sidebar -->
                    <div class="col-lg-5 mt-4 mt-lg-0">
                        <div class="card stat-card card-glass h-100 border-0 shadow-sm text-center">
                            <div class="card-body p-5 d-flex flex-column justify-content-center align-items-center">
                                <h4 class="card-title font-weight-bold mb-2">Verification</h4>
                                <p class="text-muted mb-4">Show this QR layout at the restaurant counter.</p>
                                
                                <div v-if="order.otp" class="mb-4 w-100 p-3 bg-light rounded shadow-inner">
                                    <h6 class="text-secondary small font-weight-bold letter-spacing-1 mb-2">ONE-TIME PASSWORD</h6>
                                    <h1 class="otp-code text-brand display-4 font-weight-bold mb-0" style="letter-spacing: 5px;">{{ order.otp }}</h1>
                                </div>
                                <div v-else class="mb-4 p-3 bg-success-light text-success rounded w-100">
                                    <i class="fas fa-check-circle mr-2"></i> Verified / Completed
                                </div>
                                
                                <div class="qr-container p-2 bg-white rounded shadow-sm d-inline-block">
                                    <img :src="'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' + order.qr_payload" class="img-fluid" alt="Order QR Code" style="max-width: 200px;">
                                </div>
                                <p class="small text-muted mt-3">Scan to verify pickup</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    `,
    data() { return { loading: true, error: null, order: null }; },
    async mounted() {
        this.loading = true; this.error = null;
        try {
            const token = this.$store.state.token;
            const orderId = this.$route.params.id;
            const response = await fetch(`/api/orders/${orderId}`, { headers: { 'Authentication-Token': token } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch order details.");
            this.order = data;
        } catch (err) { this.error = err.message; } finally { this.loading = false; }
    }
};

export default CustomerOrderDetailPage;