export const getAuth = () => {
    return localStorage.getItem('token');
};

export const useAuth = () => {
    const saveAuth = (token: string | undefined) => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    };

    const currentUser = {
    };

    const saveCurrentUser = (user: any) => {
        localStorage.setItem('userId', user._id);
    };

    return { getAuth, saveAuth, currentUser, saveCurrentUser };
};
