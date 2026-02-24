// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Building2, Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/login', { email, password });
            const { token, user } = response.data.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan pada server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            
            {/* Wrapper Column agar developer berada di bawah card */}
            <div className="flex flex-col items-center w-125">

                {/* Login Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    
                    <div className="text-center mb-8">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="text-primary w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">SIMAS Puloniti</h1>
                        <p className="text-gray-500 text-sm">
                            Masuk ke Panel Manajemen Masjid
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input 
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="admin@masjid.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input 
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : 'Masuk Dashboard'}
                        </button>

                    </form>
                </div>

                {/* Developer Credit */}
                <p className="text-xs text-gray-400 mt-6">
                    Developed by 
                    <a 
                        href="https://www.instagram.com/abdurrahman_al_khoodhy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 hover:text-primary transition"
                    >
                        Abdurrahman Al Khoodhy'
                    </a>
                </p>

            </div>
        </div>
    );
}