async function requireAuth() {

    const token = localStorage.getItem('access');

    if (!token) {
        window.location.href = 'profile.html';
        return;
    }

    const response = await fetch(
        '/api/v1/users/me/',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (!response.ok) {

        localStorage.removeItem('access');
        localStorage.removeItem('refresh');

        window.location.href = 'profile.html';
    }
}