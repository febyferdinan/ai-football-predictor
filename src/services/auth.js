// Mock Auth Service

const USER_KEY = 'score_predictor_user';

export const login = async (email, password) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful login
    const user = {
        id: '123',
        name: 'John Doe',
        email: email,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
    return user;
};

export const logout = () => {
    localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem(USER_KEY);
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        console.error('Failed to parse user data:', e);
        return null;
    }
};

export const isAuthenticated = () => {
    return !!localStorage.getItem(USER_KEY);
};
