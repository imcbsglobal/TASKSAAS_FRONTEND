import LoginForm from '../components/LoginForm';
import '../styles/Login.scss';
import logo from '../../../assets/TASK11.png';

const Login = () => {
    return (
        <div className="login-container">
            {/* Decorative side panels */}
            <div className="side-panel left"></div>
            <div className="side-panel right"></div>
            
            {/* Background floating blobs */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>
            <div className="bg-blob blob-3"></div>
            
            <div className="login-card-wrapper">
                {/* Left side - Login form */}
                <div className="login-card">
                    <img src={logo} alt="Logo" className="login-logo" />
                    <h2>Login in to continue</h2>
                    <p className="subtitle">
                        {/* Already have account? <a href="#signin">Sign in</a> */}
                    </p>
                    <LoginForm />
                </div>

                {/* Right side - Welcome section with animated blobs */}
                <div className="login-welcome">
                    <div className="welcome-content">
                        <h1>Hello, Welcome Back!</h1>
                        <p>Track reports, manage ledgers, and maintain accurate records — all in one place.</p>
                        
                        {/* Optional: Profile circles decoration */}
                        {/* <div className="profile-circles">
                            <div className="circle"></div>
                            <div className="circle"></div>
                            <div className="circle"></div>
                        </div> */}
                    </div>
                    
                    {/* <div className="welcome-footer">
                        www.taskprime.app
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Login;