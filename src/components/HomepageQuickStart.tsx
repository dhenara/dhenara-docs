import React, { JSX } from 'react';
import Link from '@docusaurus/Link';
import './HomepageQuickStart.css';

export default function HomepageQuickStart(): JSX.Element {
  return (
    <section className="quickstart">
      <div className="container">
        <div className="row">
          <div className="col col--6 quickstart-content">
            <h2>Get Started Quickly</h2>
            <p>
              Dhenara makes it easy to build AI-powered applications. Start with Dhenara AI for provider-agnostic model
              interactions.
            </p>
            <div className="quickstart-links">
              <Link className="quickstart-card" to="/dhenara-ai/getting-started/installation">
                <div className="quickstart-card-content">
                  <h3>Dhenara AI Installation</h3>
                  <p>Recommended: set up the core AI package for model interactions.</p>
                </div>
                <div className="quickstart-arrow">→</div>
              </Link>
              <Link className="quickstart-card" to="/dhenara-agent/getting-started/installation">
                <div className="quickstart-card-content">
                  <h3>Agent DSL Installation (Deprecated)</h3>
                  <p>Legacy agent framework docs for existing users (no longer actively developed).</p>
                </div>
                <div className="quickstart-arrow">→</div>
              </Link>
            </div>
          </div>
          <div className="col col--6 quickstart-code">
            <div className="code-header">
              <div className="code-pill">pip install</div>
            </div>
            <div className="code-block">
              <pre>
                <code>
                  # Recommended for most applications
                  <br />
                  pip install dhenara-ai
                  <br />
                  <br />
                  # Legacy (deprecated): Agent DSL framework
                  <br />
                  pip install dhenara-agent
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
