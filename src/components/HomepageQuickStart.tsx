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
              interactions — then jump into the advanced recipes.
            </p>
            <div className="quickstart-links">
              <Link className="quickstart-card" to="/dhenara-ai/getting-started/installation">
                <div className="quickstart-card-content">
                  <h3>Dhenara AI Installation</h3>
                  <p>Recommended: set up the core AI package for model interactions.</p>
                </div>
                <div className="quickstart-arrow">→</div>
              </Link>
              <Link className="quickstart-card" to="/dhenara-ai/guides/advanced-recipes">
                <div className="quickstart-card-content">
                  <h3>Advanced Recipes</h3>
                  <p>Streaming + structured output + tools + artifacts — the “good stuff”.</p>
                </div>
                <div className="quickstart-arrow">→</div>
              </Link>
            </div>

            <div style={{ marginTop: '0.75rem', opacity: 0.8 }}>
              <Link to="/dhenara-agent/getting-started/installation">Agent DSL (Deprecated)</Link>
              {' — legacy docs for existing users.'}
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
                  # Optional (deprecated): Agent DSL framework
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
