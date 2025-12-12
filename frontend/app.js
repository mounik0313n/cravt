import Navbar from "./components/Navbar.js"
import router from "./utils/router.js"
import store from "./utils/store.js"

// Firebase frontend initialization
// If you prefer to load config from the backend, remove or replace this block
// with a fetch to `/api/config/firebase` and call initializeApp with the returned config.
let firebaseApp = null
try {
    // Only attempt to initialize in browser environments
    if (typeof window !== 'undefined') {
        // Import compat-style SDKs if using the modular SDK build via script tags.
        // If you're bundling via a build system, use `import { initializeApp } from 'firebase/app'`.
        // This block uses the modular API and assumes Firebase is available (npm or CDN).
        // Inline config (replace with your own or fetch from backend in production)
        const firebaseConfig = {
            apiKey: "AIzaSyAzaeAJY6yKW4ujOFktp26q-zdt6Wo5hLM",
            authDomain: "crav-3b509.firebaseapp.com",
            projectId: "crav-3b509",
            storageBucket: "crav-3b509.firebasestorage.app",
            messagingSenderId: "687400550130",
            appId: "1:687400550130:web:489821336b954b74171a6b",
            measurementId: "G-6TFJEP745Z"
        }

        // If Firebase SDK is loaded as ES module (bundled), use it directly
        if (window.firebase && window.firebase.initializeApp) {
            // compat SDK present
            firebaseApp = window.firebase.initializeApp(firebaseConfig)
            try {
                if (window.firebase.analytics) {
                    window.firebase.analytics()
                }
            } catch (e) {
                // analytics may not be available in non-browser contexts
                console.warn('Firebase analytics init failed', e)
            }
        } else {
            // Try dynamic import of modular SDK (if project bundler allows dynamic imports)
            // This will work if you installed firebase via npm and the environment supports dynamic import.
            import('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js')
                .then(() => import('https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics-compat.js'))
                .then(() => {
                    if (window.firebase && window.firebase.initializeApp) {
                        firebaseApp = window.firebase.initializeApp(firebaseConfig)
                        try { window.firebase.analytics && window.firebase.analytics() } catch (e) { console.warn(e) }
                    }
                })
                .catch(err => console.warn('Failed to load Firebase SDKs:', err))
        }
    }
} catch (err) {
    console.warn('Firebase init skipped:', err)
}

const app = new Vue({
    el : '#app',
    template : /* html */`
        <div> 
            <Navbar />
            <router-view />
        </div>
    `,
    components : {
        Navbar,
    },
    router,
    store,
})

export { firebaseApp }