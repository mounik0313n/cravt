import apiService from '../../utils/apiService.js';

const CustomerRegisterPage = {
    template: `
        <div class="login-container">
            <div class="card login-card shadow-lg border-0 rounded-lg"> <!-- Added classes for design -->
                <div class="card-body p-5">
                    <div class="text-center mb-4">
                        <h3 class="card-title font-weight-bold">Create Account</h3>
                        <p class="text-muted">Join Foodle for the best Dine-In & Takeaway experience!</p>
                    </div>
                    
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <div v-if="loading" class="alert alert-info">{{ loading }}</div>

                    <!-- Native Registration Form -->
                    <form @submit.prevent="handleRegister">
                        <div class="form-group">
                            <label class="font-weight-bold">Name</label>
                            <input type="text" class="form-control form-control-lg" v-model="form.name" required placeholder="e.g. John Doe">
                        </div>
                        <div class="form-group">
                            <label class="font-weight-bold">Email address</label>
                            <input type="email" class="form-control form-control-lg" v-model="form.email" required placeholder="name@example.com">
                        </div>
                        <div class="form-group">
                            <label class="font-weight-bold">Password</label>
                            <div class="input-group">
                                <input :type="showPassword ? 'text' : 'password'" class="form-control form-control-lg" v-model="form.password" required placeholder="Create a strong password">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                                        <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-success btn-block btn-lg mt-4" :disabled="isLoading">
                            {{ isLoading ? 'Creating Account...' : 'Sign Up' }}
                        </button>
                    </form>

                    <div class="text-center my-3">
                        <span class="text-muted">OR</span>
                    </div>

                    <button class="btn btn-outline-dark btn-block btn-lg mb-3" @click.prevent="handleGoogleSignUp" :disabled="isLoading">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width: 20px; margin-right: 10px;">
                        Sign Up with Google
                    </button>

                    <p class="text-center mt-4">
                        Already have an account? 
                        <router-link to="/login" class="font-weight-bold">Login</router-link>
                    </p>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            form: {
                name: '',
                email: '',
                password: ''
            },
            showPassword: false,
            error: null,
            loading: '',
            isLoading: false,
            firebaseReady: false,
        };
    },
    methods: {
        async handleRegister() {
            this.error = null;
            this.loading = '';
            this.isLoading = true;

            try {
                // Use apiService to handle Environment URL logic automatically
                const data = await apiService.post('/api/register', this.form);

                this.loading = 'Account created! Redirecting to login...';
                setTimeout(() => {
                    this.$router.push('/login');
                }, 1500);

            } catch (err) {
                console.error(err);
                this.error = err.message || 'Registration failed';
            } finally {
                this.isLoading = false;
            }
        },

        async ensureFirebaseReady() {
            if (this.firebaseReady) return;
            try {
                // ApiService.get handles the absolute URL if needed
                const cfg = await apiService.get('/api/config/firebase');

                await this.loadScript('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
                await this.loadScript('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js');

                if (!window.firebase || !window.firebase.apps || window.firebase.apps.length === 0) {
                    window.firebase.initializeApp(cfg);
                }
                this.firebaseReady = true;
            } catch (e) {
                console.warn('Firebase init failed', e);
            }
        },

        loadScript(src) {
            return new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = src;
                s.onload = resolve;
                s.onerror = reject;
                document.head.appendChild(s);
            });
        },

        async handleGoogleSignUp() {
            this.error = null;
            this.loading = '';
            this.isLoading = true;

            await this.ensureFirebaseReady();
            if (!this.firebaseReady) {
                this.error = 'Firebase not configured on server';
                this.isLoading = false;
                return;
            }

            try {
                this.loading = 'Opening Google sign-up...';
                const provider = new window.firebase.auth.GoogleAuthProvider();
                const result = await window.firebase.auth().signInWithPopup(provider);
                const idToken = await result.user.getIdToken();

                this.loading = 'Creating account...';
                // Use apiService for consistency
                const data = await apiService.post('/api/auth/firebase', { idToken });

                await this.$store.dispatch('loginWithToken', { token: data.token, user: data.user });

                const userRoles = this.$store.getters.userRoles;
                if (userRoles.includes('admin')) {
                    this.$router.push('/admin/dashboard');
                } else if (userRoles.includes('owner')) {
                    this.$router.push('/restaurant/dashboard');
                } else {
                    this.$router.push('/');
                }

            } catch (err) {
                console.error(err);
                this.error = err.message || 'Google sign-up failed';
            } finally {
                this.isLoading = false;
                this.loading = '';
            }
        },
    },
};

export default CustomerRegisterPage;