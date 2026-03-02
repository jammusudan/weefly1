export const getApiBase = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // In development, hit the backend directly on port 5005.
        // We prefer 127.0.0.1 over localhost to avoid IPv6/IPv4 resolution issues on Windows.
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
            // If the user is on localhost, force 127.0.0.1 for the backend call
            const targetHost = (hostname === 'localhost') ? '127.0.0.1' : hostname;
            return `http://${targetHost}:5005`;
        }

        const override = localStorage.getItem('API_URL');
        if (override) return override;
    }
    // Default to relative for production/proxy
    return '';
};
