import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import styles from "./Login.module.css";

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/login' : '/register';

        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API_URL}/auth${endpoint}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('name', data.name);

                navigate("/dashboard");
            } else setError(data.message);
        } catch (error) {
            setError("Erro de conexão com o servidor.");
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const data = await response.json();
            
            if (response.ok && data.name) {
                sessionStorage.setItem('name', data.name);
                
                navigate("/dashboard");
            } else setError(data.message);
        } catch (error) {
            setError("Erro de conexão com o servidor.");
        }
    };

    return (
        <form className={styles["login-container"]} onSubmit={handleSubmit}>
            <h1>{ isLogin ? "LOGIN" : "REGISTER" }</h1>
            
            { error && <span className={styles["error"]}>{error}</span> }
        
            <div className={styles["input-group"]}>
                <label>EMAIL</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>

            { isLogin ? ("") : (
                <>
                    <div className={styles["input-group"]}>
                        <label>NAME</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" required />
                    </div>
                </>
            )}
        
            <div className={styles["input-group"]}>
                <label>PASSWORD</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
        
            <button type="submit">{ isLogin ? "SIGN IN" : "SIGN UP" }</button>
        
            <div className={styles["divider"]}>OR</div>
        
            <div className={styles["social-login"]} style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => alert('Falha ao autenticar com o Google')}
                />
            </div>
        
            <div className={styles["footer"]}>
                { isLogin ? (
                    <>
                        <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>Sign up</a></p>
                    </>
                ) : (
                    <>
                        <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>Sign in</a></p>
                    </>
                ) }
            </div>
        </form>
    );
}

export default Login;