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
              Dhenara makes it easy to build AI-powered applications. Follow our quick start guides to get up and
              running in minutes.
            </p>
            <div className="quickstart-links">
              <Link className="quickstart-card" to="/dhenara-agent/getting-started/installation">
                <div className="quickstart-card-content">
                  <h3>Dhenara Agent Installation</h3>
                  <p>Install the agent framework for complex workflows. This also includes AI package.</p>
                </div>
                <div className="quickstart-arrow">→</div>
              </Link>
              <Link className="quickstart-card" to="/dhenara-ai/getting-started/installation">
                <div className="quickstart-card-content">
                  <h3>Dhenara AI Installation</h3>
                  <p>Set up the core AI package for model interactions</p>
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
                  # Install Agent package for both
                  <br />
                  pip install dhenara-agent
                  <br />
                  <br />
                  # Or install core AI package for simple applications
                  <br />
                  pip install dhenara-ai
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
