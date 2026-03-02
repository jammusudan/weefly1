export const getApiBase = () => {
    if (typeof window !== 'undefined') {
        const override = localStorage.getItem('API_URL');
        if (override) return override;

        // Default to relative if no override
        return '';
    }
    return '';
};
