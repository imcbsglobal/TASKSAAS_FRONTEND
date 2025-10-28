import LoginForm from '../components/LoginForm';
import '../styles/Login.scss';
import logo from '../../../assets/TASK11.png';

const Login = () => {
    return (
        <div className="login-container">
            <div className="login-card">
                <img src={logo} alt="Logo" className="login-logo" />
                <LoginForm />
            </div>
        </div>
    );
};

export default Login;