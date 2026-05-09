import React, { useEffect } from 'react';
import Hero from '../components/landing/Hero';
import TutorSection from '../components/landing/TutorSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import MockExamSection from '../components/landing/MockExamSection';
import Testimonials from '../components/landing/Testimonials';
import PricingTable from '../components/landing/PricingTable';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Scroll to top on mount and redirect if logged in
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section');
        
        if (section === 'features') {
            const element = document.getElementById('features');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }

        if (!loading && user) {
            console.log("[LandingPage] User is logged in, redirecting to dashboard...");
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <Header />
            <main className="flex-1">
                <Hero />
                <TutorSection />
                <MockExamSection id="features" />
                <FeaturesSection />
                <Testimonials />
                <PricingTable />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
