import React, { useEffect } from 'react';
import Hero from '../components/landing/Hero';
import TutorSection from '../components/landing/TutorSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import DreamSubjectSection from '../components/landing/DreamSubjectSection';
import MockExamSection from '../components/landing/MockExamSection';
import Testimonials from '../components/landing/Testimonials';
import PricingTable from '../components/landing/PricingTable';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const USE_ENTRA = import.meta.env.VITE_USE_ENTRA === 'true';

const LandingPage = () => {
    const { user, loading, initialized } = useAuth();
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

        // Don't redirect to dashboard during logout transition.
        // The logout flow sets aceit_post_logout_home in sessionStorage before
        // navigating to Microsoft; while that is set we should stay on the landing page.
        if (!loading && user && sessionStorage.getItem('aceit_post_logout_home') !== 'true') {
            console.log("[LandingPage] User is logged in, redirecting to dashboard...");
            navigate('/dashboard', { replace: true });
        }
    }, [user, loading, navigate]);

    // After Microsoft redirects back to the root (/), AuthContext will resolve the identity.
    // If the user is NOT logged in but there is an OAuth hash in the URL, we need to make
    // sure the hash gets processed.  MSAL's handleRedirectPromise() only processes the hash
    // once; if the singleton was stale when the page first loaded, the hash may still be
    // unprocessed.  In that case, force a reload so a fresh MSAL instance can pick it up.
    useEffect(() => {
        if (USE_ENTRA && !user && !loading && initialized) {
            const hash = window.location.hash || '';
            if (hash.includes('code=') || hash.includes('error=')) {
                console.warn('[LandingPage] OAuth hash still present after auth init finished. Reloading to process...');
                window.location.reload();
            }
        }
    }, [user, loading, initialized]);

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            <Header />
            <main className="flex-1">
                <Hero />
                <TutorSection />
                <MockExamSection id="features" />
                <FeaturesSection />
                <DreamSubjectSection />
                <Testimonials />
                <PricingTable />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
