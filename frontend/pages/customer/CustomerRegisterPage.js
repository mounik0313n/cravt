const CustomerRegisterPage = {
    template: `
        <div class="login-container">
            <div class="card login-card">
                <div class="card-body">
                    <div class="text-center mb-4">
                        <h3 class="card-title">Create an Account</h3>
                        <p class="text-muted">Join Foodle to order your favorite food!</p>
                    </div>
                    
                    <div v-if="error" class="alert alert-danger">{{ error }}</div>
                    <div v-if="loading" class="alert alert-info">{{ loading }}</div>

                    <button class="btn btn-primary btn-block mb-3" @click.prevent="handleGoogleSignUp" :disabled="isLoading">
                        {{ isLoading ? 'Signing up...' : 'Sign Up with Google' }}
                    </button>

                    <div class="text-center my-3">
                        <small class="text-muted">Quick, easy sign-up with your Google account</small>
                    </div>

                    <p class="text-center small mt-4">
                        Already have an account? 
                        <router-link to="/login">Login</router-link>
                    </p>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            error: null,
            loading: '',
            isLoading: false,
            firebaseReady: false,
        };
    },
    methods: {
        async ensureFirebaseReady() {
            if (this.firebaseReady) return;
            try {
                const res = await fetch('/api/config/firebase');
                if (!res.ok) return;
                const contentType = res.headers.get('content-type') || '';
                let cfg = null;
                if (contentType.includes('application/json')) {
                    // Safe to parse as JSON
                    cfg = await res.json();
                } else {
                    // Non-JSON response (HTML or plain text) - likely a 200 HTML page from hosting
                    console.warn('Firebase config endpoint returned non-JSON content-type:', contentType);
                    return; // fail gracefully; frontend app.js may have inline config
                }

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
                const resp = await fetch('/api/auth/firebase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idToken })
                });

                const data = await resp.json();
                if (!resp.ok) {
                    throw new Error(data.message || 'Sign-up failed');
                }

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