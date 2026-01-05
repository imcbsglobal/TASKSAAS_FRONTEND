import LoginForm from '../components/LoginForm';
import '../styles/Login.scss';
import logo from '../../../assets/TASK11.png';

const Login = () => {
    return (
        <div className="login-container">
            {/* Left side - Welcome section with animated blobs */}
            <div className="login-welcome">
                {/* Floating gradient blobs */}
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                
                <div className="welcome-content">
                    <h1>Hello, Welcome !</h1>
                    <p>Manage your tasks and projects with clarity and control.</p>
                </div>
                
                <div className="welcome-footer">
                    {/* www.taskprime.app */}
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="login-card">
                <img src={logo} alt="Logo" className="login-logo" />
                <h2>Login in to continue</h2>
                <LoginForm />
            </div>
        </div>
    );
};

export default Login;