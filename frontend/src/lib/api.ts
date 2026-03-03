
export const getApiBase = () => {
  // 1️⃣ Browser side
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // 🔹 Local development
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    ) {
      const targetHost = hostname === 'localhost' ? '127.0.0.1' : hostname;
      return `http://${targetHost}:5005`;
    }

    // 🔹 Optional manual override
    const override = localStorage.getItem('API_URL');
    if (override) return override;
  }

  // 2️⃣ PRODUCTION (THIS WAS MISSING)
  return process.env.NEXT_PUBLIC_API_URL || '';
};