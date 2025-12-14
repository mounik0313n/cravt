import apiService from '../../utils/apiService.js';

const RestaurantDashboardPage = {
    template: `
        <div class="container-fluid py-5 bg-gradient-light">
            <!-- Header Section -->
            <div class="d-flex justify-content-between align-items-center mb-5 fade-in">
                <div>
                    <h2 class="display-5 font-weight-bold text-dark mb-1">Business Dashboard</h2>
                    <p class="text-muted mb-0">Overview of your restaurant's performance and settings.</p>
                </div>
                <button class="btn btn-brand btn-lg shadow-sm pill-btn" @click="refreshAllData" :disabled="loading">
                    <i class="fas fa-sync-alt mr-2" :class="{'fa-spin': loading}"></i> Refresh
                </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
                 <div class="spinner-border text-brand" style="width: 3rem; height: 3rem;" role="status"></div>
                 <p class="mt-3 text-muted font-weight-medium">Gathering your business insights...</p>
            </div>
            
            <!-- Error State -->
            <div v-if="error" class="alert alert-danger shadow-sm border-0 rounded-lg">{{ error }}</div>

            <div v-if="!loading && !error" class="fade-in">
                
                <!-- Quick Stats Row -->
                <div class="row mb-4">
                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card stat-card card-glass h-100 p-4 border-0">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <p class="text-uppercase text-muted font-weight-bold small mb-2 spacing-1">Daily Revenue</p>
                                    <h2 class="text-dark font-weight-bold mb-0">₹{{ (stats && stats.todaysRevenue ? stats.todaysRevenue : 0).toLocaleString('en-IN') }}</h2>
                                </div>
                                <div class="icon-square bg-light-success text-success rounded-circle p-3">
                                    <i class="fas fa-rupee-sign fa-lg"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card stat-card card-glass h-100 p-4 border-0">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <p class="text-uppercase text-muted font-weight-bold small mb-2 spacing-1">Today's Orders</p>
                                    <h2 class="text-dark font-weight-bold mb-0">{{ (stats && stats.todaysOrders ? stats.todaysOrders : 0).toLocaleString() }}</h2>
                                </div>
                                <div class="icon-square bg-light-brand text-brand rounded-circle p-3">
                                    <i class="fas fa-shopping-bag fa-lg"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-md-6 mb-4">
                        <div class="card stat-card card-glass h-100 p-4 border-0">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <p class="text-uppercase text-muted font-weight-bold small mb-2 spacing-1">Pending Actions</p>
                                    <h2 class="text-dark font-weight-bold mb-0">{{ stats ? stats.pendingOrders : 0 }}</h2>
                                </div>
                                <div class="icon-square bg-light-warning text-warning rounded-circle p-3">
                                    <i class="fas fa-clock fa-lg"></i>
                                </div>
                            </div>
                            <div class="mt-3">
                                <span class="badge badge-pill px-3" :class="(stats && stats.pendingOrders > 0) ? 'badge-warning text-white' : 'badge-success'">
                                    {{ (stats && stats.pendingOrders > 0) ? 'Requires Attention' : 'All Caught Up' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Grid -->
                <div class="row">
                    <!-- Left Column: Recent Activity & Queue Link -->
                    <div class="col-lg-8">
                        <div class="card card-glass border-0 shadow-sm mb-4">
                            <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center p-4">
                                <h5 class="font-weight-bold mb-0 text-dark">Recent Activity</h5>
                                <button class="btn btn-outline-brand btn-sm rounded-pill px-3" @click="$router.push('/restaurant/orders')">
                                    Go to Live Queue <i class="fas fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                            <div class="card-body p-0">
                                <div class="table-responsive">
                                    <table class="table table-hover mb-0">
                                        <thead class="bg-light text-muted">
                                            <tr>
                                                <th class="border-0 px-4 py-3 font-weight-medium">Order ID</th>
                                                <th class="border-0 px-4 py-3 font-weight-medium">Customer</th>
                                                <th class="border-0 px-4 py-3 font-weight-medium">Total</th>
                                                <th class="border-0 px-4 py-3 font-weight-medium text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="recentOrders.length === 0">
                                                <td colspan="4" class="text-center py-5 text-muted">
                                                    <i class="fas fa-clipboard-list fa-3x mb-3 text-light-gray"></i>
                                                    <p>No recent activity.</p>
                                                </td>
                                            </tr>
                                            <tr v-for="order in recentOrders" :key="order.id">
                                                <td class="px-4 py-3 font-weight-bold">#{{ order.id }}</td>
                                                <td class="px-4 py-3">
                                                    <div class="d-flex align-items-center">
                                                        <div class="avatar-circle mr-2 bg-light-secondary text-secondary font-weight-bold small d-flex align-items-center justify-content-center" style="width:32px;height:32px;border-radius:50%">{{ (order.customerName || '?').charAt(0) }}</div>
                                                        {{ order.customerName || 'Unknown' }}
                                                    </div>
                                                </td>
                                                <td class="px-4 py-3 font-weight-bold text-dark">₹{{ order.total.toLocaleString('en-IN') }}</td>
                                                <td class="px-4 py-3 text-center">
                                                    <span class="badge badge-pill px-3 py-2 font-weight-normal text-uppercase small" 
                                                          :class="{
                                                            'badge-success': order.status === 'completed',
                                                            'badge-warning': order.status === 'pending' || order.status === 'preparing',
                                                            'badge-info': order.status === 'ready',
                                                            'badge-danger': order.status === 'cancelled'
                                                          }">
                                                        {{ order.status }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Popular Items & Fees -->
                    <div class="col-lg-4">
                        <!-- Popular Items -->
                        <div class="card card-glass border-0 shadow-sm mb-4">
                            <div class="card-body p-4">
                                <h5 class="font-weight-bold mb-4 text-dark">Top Items</h5>
                                <ul class="list-group list-group-flush">
                                    <li v-if="popularItems.length === 0" class="list-group-item text-muted text-center border-0 p-3">Wait for your first order!</li>
                                    <li v-for="(item, index) in popularItems" :key="index" class="list-group-item d-flex justify-content-between align-items-center border-0 px-0 py-2 bg-transparent">
                                        <div class="d-flex align-items-center">
                                             <span class="mr-3 text-muted font-weight-bold h5 mb-0" style="opacity: 0.4">0{{ index + 1 }}</span>
                                             <span class="font-weight-medium text-dark">{{ item.name }}</span>
                                        </div>
                                        <span class="badge badge-light-brand text-brand font-weight-bold px-2 py-1">{{ item.orders }} sold</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- Fee Configuration -->
                        <div class="card card-glass border-0 shadow-sm">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-center mb-4">
                                    <h5 class="font-weight-bold mb-0 text-dark">Fee Settings</h5>
                                    <button class="btn btn-sm btn-brand rounded-pill" @click="saveFeeSettings" :disabled="savingFees">
                                        {{ savingFees ? 'Saving...' : 'Save' }}
                                    </button>
                                </div>
                                
                                <form @submit.prevent="saveFeeSettings">
                                    <div class="form-group mb-3">
                                        <label class="small font-weight-bold text-muted text-uppercase spacing-1">Delivery Fee (₹)</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control" v-model.number="feeSettings.delivery_fee" min="0">
                                        </div>
                                    </div>
                                    <div class="form-group mb-3">
                                        <label class="small font-weight-bold text-muted text-uppercase spacing-1">Takeaway Fee (₹)</label>
                                        <input type="number" class="form-control" v-model.number="feeSettings.takeaway_fee" min="0">
                                    </div>
                                    <div class="form-group mb-3">
                                        <label class="small font-weight-bold text-muted text-uppercase spacing-1">Dine-In Fee (₹)</label>
                                        <input type="number" class="form-control" v-model.number="feeSettings.dine_in_fee" min="0">
                                    </div>
                                     <div class="form-group mb-0">
                                        <label class="small font-weight-bold text-muted text-uppercase spacing-1">Platform Fee (₹)</label>
                                        <input type="number" class="form-control" v-model.number="feeSettings.platform_fee" min="0">
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            loading: true,
            savingFees: false,
            error: null,
            stats: {
                todaysRevenue: 0,
                todaysOrders: 0,
                pendingOrders: 0,
            },
            recentOrders: [],
            popularItems: [],
            feeSettings: {
                delivery_fee: 50,
                takeaway_fee: 20,
                dine_in_fee: 10,
                platform_fee: 7
            }
        };
    },
    async mounted() {
        await this.refreshAllData();
    },
    methods: {
        async refreshAllData() {
            this.loading = true;
            this.error = null;
            try {
                await Promise.all([
                    this.fetchDashboardData(),
                    this.fetchFeeSettings()
                ]);
            } catch (err) {
                console.error("Partial failure in loading dashboard", err);
                // Don't block UI if one fails, try to show what we have (handled individually if needed, but here simple error is fine)
            } finally {
                this.loading = false;
            }
        },
        async fetchDashboardData() {
            try {
                const data = await apiService.get('/api/restaurant/dashboard');
                this.stats = data.stats;
                this.recentOrders = data.recentOrders;
                this.popularItems = data.popularItems;
            } catch (err) {
                this.error = "Could not load dashboard stats.";
                throw err;
            }
        },
        async fetchFeeSettings() {
            try {
                const data = await apiService.get('/api/restaurant/fees');
                this.feeSettings = data;
            } catch (e) {
                console.error("Failed to fetch fees", e);
            }
        },
        async saveFeeSettings() {
            this.savingFees = true;
            try {
                await apiService.put('/api/restaurant/fees', this.feeSettings);
                alert("Fees updated successfully!");
            } catch (e) {
                alert("Failed to update fees: " + e.message);
            } finally {
                this.savingFees = false;
            }
        }
    }
};

export default RestaurantDashboardPage;
