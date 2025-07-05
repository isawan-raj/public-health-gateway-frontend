import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ReferralPage from './ReferralPage'; // Import the renamed ReferralPage
import KpiDashboardPage from './KpiDashboardPage'; // Import the new KpiDashboardPage

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100 font-sans antialiased flex flex-col"> {/* Added flex-col */}
                {/* Navigation Header */}
                <nav className="bg-blue-700 p-4 shadow-md">
                    <div className="container mx-auto flex justify-between items-center">
                        <Link to="/" className="text-white text-2xl font-bold rounded-md px-3 py-2 hover:bg-blue-600 transition-colors">
                            Public Health Gateway {/* Changed Name */}
                        </Link>
                        <div className="space-x-4">
                            <Link to="/referral" className="text-white text-lg font-medium rounded-md px-3 py-2 hover:bg-blue-600 transition-colors">
                                Referral System
                            </Link>
                            <Link to="/kpi-dashboard" className="text-white text-lg font-medium rounded-md px-3 py-2 hover:bg-purple-600 transition-colors">
                                KPI Dashboard
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Main Content Area with Routes - Takes available space */}
                <main className="flex-grow p-4"> {/* Added flex-grow */}
                    <Routes>
                        <Route path="/" element={<HomeContent />} /> {/* Optional Home Page */}
                        <Route path="/referral" element={<ReferralPage />} />
                        <Route path="/kpi-dashboard" element={<KpiDashboardPage />} />
                        {/* Add a catch-all route for 404 if desired */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>

                {/* Global Footer (Visible on all pages) */}
                <footer className="mt-12 py-6 border-t border-gray-200 text-center text-gray-600 text-sm bg-white shadow-inner"> {/* Increased mt, py and added bg-white shadow */}
                    <p>Developed by Sawan Raj</p>
                </footer>
            </div>
        </Router>
    );
}

// Simple Home Page Component
function HomeContent() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center">
            <h2 className="text-5xl font-extrabold text-gray-800 mb-6">Welcome to Public Health Gateway!</h2> {/* Changed Name */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Navigate through the Healthcare Referral System or explore the Health KPI Dashboard using the links below.
            </p>
            <div className="flex space-x-4">
                <Link to="/referral" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    Go to Referral System
                </Link>
                <Link to="/kpi-dashboard" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                    Go to KPI Dashboard
                </Link>
            </div>
        </div>
    );
}

// Simple 404 Not Found Component
function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center text-red-500">
            <h2 className="text-5xl font-extrabold mb-4">404 - Page Not Found</h2>
            <p className="text-xl">The page you are looking for does not exist.</p>
            <Link to="/" className="mt-6 text-blue-600 hover:underline">Go to Home</Link>
        </div>
    );
}

export default App;

    