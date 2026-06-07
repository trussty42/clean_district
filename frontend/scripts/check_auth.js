async function requireAuth() {
    const token = localStorage.getItem('ck_access_token');

    if (!token) {
        window.location.href = 'profile.html';
        return;
    }

    const response = await fetch('/api/v1/users/me/', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        localStorage.removeItem('ck_access_token');
        localStorage.removeItem('ck_refresh_token');

        window.location.href = 'profile.html';
    }
}