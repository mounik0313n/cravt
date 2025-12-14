import CartItem from '../../components/CartItem.js';

const CustomerCartPage = {
    components: { CartItem },
    template: `
        <div class="container my-5">
            <h2 class="text-center mb-5 font-weight-bold">Your Shopping <span class="text-brand">Cart</span></h2>
            
            <div v-if="cartItems.length > 0" class="row">
                <!-- Cart Items List -->
                <div class="col-lg-8 mb-4">
                    <div class="card card-glass border-0 shadow-sm">
                        <div class="card-body p-4">
                            <div v-for="(item, index) in cartItems" :key="item.id" class="mb-3">
                                <CartItem :cartItem="item" @update-quantity="updateQuantity" @remove-item="removeItem"/>
                                <hr v-if="index < cartItems.length - 1" class="border-light my-3">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="col-lg-4">
                    <div class="card stat-card card-glass border-0 shadow-sm sticky-top" style="top: 100px;">
                        <div class="card-body p-4">
                            <h4 class="card-title font-weight-bold mb-4">Order Summary</h4>
                            <ul class="list-group list-group-flush mb-4">
                                <li class="list-group-item bg-transparent d-flex justify-content-between border-bottom-0 pb-1 px-0">
                                    <span class="text-muted">Item Total</span>
                                    <span class="font-weight-medium">₹{{ subtotal.toLocaleString('en-IN') }}</span>
                                </li>
                                <!-- Fees are calculated at Checkout -->
                                <li class="list-group-item bg-transparent d-flex justify-content-between border-top mt-2 pt-3 px-0">
                                    <h5 class="font-weight-bold">Subtotal</h5>
                                    <h5 class="font-weight-bold text-brand">₹{{ subtotal.toLocaleString('en-IN') }}</h5>
                                </li>
                            </ul>
                            
                            <button class="btn btn-brand btn-block btn-lg shadow-lg" @click="$router.push('/checkout')">
                                Proceed to Checkout <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                            <p class="text-center text-muted small mt-3 mb-0">
                                <i class="fas fa-info-circle mr-1"></i> Taxes & Fees calculated at checkout
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty Cart State -->
            <div v-else class="text-center py-5">
                <div class="mb-4">
                    <i class="fas fa-shopping-basket fa-4x text-muted opacity-50"></i>
                </div>
                <h3 class="font-weight-bold mb-3">Your Cart is Empty</h3>
                <p class="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
                <button class="btn btn-brand btn-lg shadow-sm rounded-pill px-5" @click="$router.push('/')">
                    Start Exploration
                </button>
            </div>
        </div>
    `,
    data() {
        return {};
    },
    computed: {
        ...Vuex.mapGetters(['cartItems', 'cartTotal']),
        subtotal() { return this.cartTotal; },
        total() { return this.subtotal; }
    },
    methods: {
        updateQuantity(payload) { this.$store.dispatch('updateCartQuantity', payload); },
        removeItem(itemId) { this.$store.dispatch('removeItemFromCart', itemId); }
    }
};

export default CustomerCartPage;
