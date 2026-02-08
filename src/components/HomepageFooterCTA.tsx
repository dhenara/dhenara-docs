import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import './HomepageFooterCTA.css';

export default function HomepageFooterCTA(): JSX.Element {
  return (
    <section className="footer-cta">
      <div className="container">
        <div className="footer-cta-content">
          <h2>Ready to Build with Dhenara?</h2>
          <p>Start with Dhenara AI. Legacy Agent DSL docs remain available for existing users.</p>
          <div className="footer-cta-buttons">
            <Link className="button button--primary button--lg" to="/dhenara-ai/introduction">
              Explore Dhenara AI
            </Link>
            <Link className="button button--outline button--secondary button--lg" to="/dhenara-agent/introduction">
              Agent DSL Docs (Deprecated)
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
