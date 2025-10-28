import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role = "" }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Check if both user data and token exist
    if (!user || !user.client_id || !token) {
        // Clear any partial data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return <Navigate to="/" replace />;
    }
    if (role && !user.role == role) {
        return
    }
    return children;
};

export default ProtectedRoute;