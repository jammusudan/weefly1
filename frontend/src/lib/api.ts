export const getApiBase = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // In development, hit the backend directly on port 5005.
        // This ensures whether using localhost, 127.0.0.1, or LAN IP, the frontend always finds its backend.
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
            return `http://${hostname}:5005`;
        }

        const override = localStorage.getItem('API_URL');
        if (override) return override;
    }
    // Default to relative for production/proxy
    return '';
};
