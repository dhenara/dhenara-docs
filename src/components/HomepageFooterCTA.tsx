import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import './HomepageFooterCTA.css';

export default function HomepageFooterCTA(): JSX.Element {
  return (
    <section className="footer-cta">
      <div className="container">
        <div className="footer-cta-content">
          <h2>Ready to Build with Dhenara?</h2>
          <p>Start creating powerful AI applications today with our comprehensive frameworks.</p>
          <div className="footer-cta-buttons">
            <Link className="button button--primary button--lg" to="/dhenara-agent/introduction">
              Discover Dhenara Agents
            </Link>
            <Link
              className="button button--outline button--secondary button--lg"
              to="/dhenara-ai/introduction"
            >
              Explore Dhenara AI
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
