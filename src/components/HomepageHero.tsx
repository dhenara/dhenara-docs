import React, { JSX } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import './HomepageHero.css';

export default function HomepageHero(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className="hero-banner">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">Dhenara Documentation</h1>
          <p className="hero-subtitle">
            Build powerful AI applications with Dhenara's open-source frameworks
          </p>
          <div className="hero-buttons">
            <Link
              className="button button--primary button--lg"
              to="/dhenara-agent/getting-started/installation"
            >
              Get Started
            </Link>
            <Link className="button button--secondary button--lg" to="/dhenara-agent/introduction">
              Explore Agents
            </Link>
          </div>
        </div>
        <div className="hero-graphic">
          <div className="hero-graphic-inner">
            <div className="cube-1"></div>
            <div className="cube-2"></div>
            <div className="cube-3"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
