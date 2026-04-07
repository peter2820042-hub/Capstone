import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';
import {
  SmartManagementIcon,
  RealTimeUpdatesIcon,
  FinancialTrackingIcon,
  ResidentPortalIcon,
  GisMappingIcon,
  SafetySecurityIcon,
} from './components/FeatureIcons';

const features = [
  {
    icon: SmartManagementIcon,
    title: 'Smart Management',
    description: 'Streamline all Calamba community operations with our intuitive dashboard and powerful tools.',
  },
  {
    icon: RealTimeUpdatesIcon,
    title: 'Real-time Updates',
    description: 'Stay informed with instant notifications, alerts, and Calamba community updates.',
  },
  {
    icon: FinancialTrackingIcon,
    title: 'Financial Tracking',
    description: 'Manage billing, payments, and financial reports for Calamba residents with complete transparency.',
  },
  {
    icon: ResidentPortalIcon,
    title: 'Resident Portal',
    description: 'Give Calamba residents easy access to their accounts, payments, and community information.',
  },
  {
    icon: GisMappingIcon,
    title: 'GIS Mapping',
    description: 'Visualize Calamba communities with interactive maps and location-based information.',
  },
  {
    icon: SafetySecurityIcon,
    title: 'Safety & Security',
    description: 'Comprehensive security features for Calamba including violation tracking and audit logs.',
  },
];

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="brand-name">Calamba Sentrina</span>
            </h1>
            <p className="hero-subtitle">
              Modern community management for Calamba's vibrant neighborhoods.
            </p>
            <p className="hero-description">
              Join the Calamba Sentrina community that trusts our platform for efficient neighborhood management. We bring together Calamba residents, staff, and administrators in one seamless digital environment.
            </p>
            <div className="hero-buttons">
              <a href="#features" className="btn btn-primary">
                Explore Features
              </a>
              <Link to="/login" className="btn btn-secondary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">
            Everything you need to manage Calamba communities efficiently
          </p>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Calamba Community Management?</h2>
            <p>Join the growing Calamba community that trusts Sentrina for their management needs.</p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-primary">
                Open Your Account Now!
              </Link>
              <a href="#features" className="btn btn-outline">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3>Calamba Sentrina</h3>
              <p>Modern community management platform for Calamba</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#demo">Demo</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#blog">Blog</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <ul>
                  <li><a href="#privacy">Privacy Policy</a></li>
                  <li><a href="#terms">Terms of Service</a></li>
                  <li><a href="#security">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Sentrina. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
