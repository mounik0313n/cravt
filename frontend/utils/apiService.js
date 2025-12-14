/*
* This is a NEW file.
* This file creates a central "client" for all your API requests.
* It automatically gets the token from the Vuex store and adds it
* to the headers of every request. This fixes all your 401/403 errors.
*
* You will no longer use `fetch` in your page components.
* You will use `apiService.get()`, `apiService.post()`, etc. instead.
*/
import store from './store.js';

// This is our new, central fetch function
async function apiFetch(url, options = {}) {
    // Get the token from the Vuex store
    const token = store.state.token;

    // Create default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Allow custom headers to be passed in
    };

    // If the token exists, add it to the headers
    if (token) {
        headers['Authentication-Token'] = token;
    }

    // Define the backend URL based on environment
    let BACKEND_URL = ''; // Default to relative path (standard for same-origin/hosted together)

    // HELPER: This block ONLY runs on your machine. It does NOT run on Render.
    // It allows you to develop locally without complex setup.
    // When hosted on Render (same origin), we use relative paths.
    // If running locally (port 5500 or 8080), assume backend is on port 10000.
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (window.location.port !== '10000') {
            BACKEND_URL = 'http://localhost:10000';
        }
    }

    // Build the full request options
    const config = {
        ...options,
        headers,
    };

    // Perform the fetch request
    const response = await fetch(BACKEND_URL + url, config);

    // Check if the response is ok (status 200-299)
    if (!response.ok) {
        // If not ok, try to parse the error message from the backend
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // The error response wasn't JSON (it was probably HTML)
            console.error("Could not parse error response as JSON");
        }
        // Throw an error to be caught by the component
        throw new Error(errorMessage);
    }

    // If the response is ok, return the JSON data
    // Handle 204 No Content response
    if (response.status === 204) {
        return null;
    }
    return response.json();
}

// Create simple-to-use exported functions
const apiService = {
    get(url) {
        return apiFetch(url, { method: 'GET' });
    },
    post(url, data) {
        return apiFetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    put(url, data) {
        return apiFetch(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
    patch(url, data) {
        return apiFetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
    delete(url) {
        return apiFetch(url, { method: 'DELETE' });
    },
};

export default apiService;
