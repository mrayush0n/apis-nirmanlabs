
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // Assuming firestore is initialized or will be
// Note: We need to initialize Firestore in firebaseConfig if we want to store extra user details like Age/Designation
// For now, I will add Firestore init to this file or assume it's available. 
// Actually, let's update firebaseConfig to export db as well if possible, but for now I'll use a simple auth flow and maybe store extra data in local state or try to init firestore here if config allows.
// Given strict instructions, I'll focus on the UI and Auth flow first.

interface AuthProps {
    onLogin: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [designation, setDesignation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }

                // Create User
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update Profile
                await updateProfile(user, {
                    displayName: fullName
                });

                // Store extra details (Mocking this part or assuming Firestore integration later)
                // console.log("User details:", { age, designation });

            } else {
                // Sign In
                await signInWithEmailAndPassword(auth, email, password);
            }
            // Auth state listener in App.tsx will handle the transition, but we can also trigger onLogin here
        } catch (err: any) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError('');
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            console.error(err);
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100%',
            background: 'var(--bg-deep)',
            backgroundImage: 'var(--bg-gradient)'
        }}>
            <div className="auth-box" style={{
                background: 'var(--glass-panel)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-panel-border)',
                padding: '40px',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div className="logo" style={{
                        width: '60px', height: '60px', borderRadius: '15px',
                        background: 'linear-gradient(135deg, var(--accent-primary), #f59e0b)',
                        margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: 'bold', color: 'white'
                    }}>A</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {isSignup ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {isSignup ? 'Join APIS Assistant today' : 'Sign in to continue'}
                    </p>
                </div>

                {error && (
                    <div className="error-message" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {isSignup && (
                        <>
                            <div className="form-group">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    type="number"
                                    placeholder="Age"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    required
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <input
                                    type="text"
                                    placeholder="Designation"
                                    value={designation}
                                    onChange={(e) => setDesignation(e.target.value)}
                                    required
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>

                    {isSignup && (
                        <div className="form-group">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={{
                        background: 'linear-gradient(135deg, var(--accent-primary), #d97706)',
                        color: 'white',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'wait' : 'pointer',
                        marginTop: '10px',
                        transition: 'transform 0.2s',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="divider" style={{
                    display: 'flex', alignItems: 'center', gap: '10px', margin: '24px 0', color: 'var(--text-tertiary)', fontSize: '13px'
                }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-panel-border)' }}></div>
                    OR
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-panel-border)' }}></div>
                </div>

                <button
                    onClick={handleGoogleSignIn}
                    type="button"
                    style={{
                        width: '100%',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--glass-panel-border)',
                        color: 'var(--text-primary)',
                        padding: '12px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'background 0.2s'
                    }}
                >
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.284 47.269 -26.754 49.129 -26.754 51.129 C -26.754 53.129 -26.284 54.989 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.769 C -12.984 43.769 -11.404 44.379 -10.154 45.579 L -6.714 42.139 C -8.804 40.189 -11.514 39.019 -14.754 39.019 C -19.444 39.019 -23.494 41.719 -25.464 45.639 L -21.484 48.729 C -20.534 45.879 -17.884 43.769 -14.754 43.769 Z" />
                        </g>
                    </svg>
                    Continue with Google
                </button>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {isSignup ? "Already have an account? " : "Don't have an account? "}
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--accent-primary)',
                            fontWeight: '600', cursor: 'pointer', padding: 0
                        }}
                    >
                        {isSignup ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--glass-panel-border)',
    borderRadius: '12px',
    color: 'var(--text-primary)',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s'
};

export default Auth;
