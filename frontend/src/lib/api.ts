export const getApiBase = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

        // If local, hit the backend directly to bypass proxy issues
        if (isLocal) {
            return 'http://127.0.0.1:5000';
        }

        const override = localStorage.getItem('API_URL');
        if (override) return override;
    }
    // Default to relative for production/proxy
    return '';
};
