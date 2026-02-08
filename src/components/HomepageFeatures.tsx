import React, { JSX } from 'react';
import clsx from 'clsx';
import './HomepageFeatures.css';

type FeatureItem = {
  title: string;
  description: JSX.Element;
  icon: JSX.Element;
};

const dhenaraiFeatures: FeatureItem[] = [
  {
    title: 'Unified API, Simplified',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 11a9 9 0 0 1 9 9"></path>
        <path d="M4 4a16 16 0 0 1 16 16"></path>
        <circle cx="5" cy="19" r="2"></circle>
        <circle cx="12" cy="12" r="3"></circle>
        <circle cx="19" cy="5" r="2"></circle>
      </svg>
    ),
    description: (
      <>
        Access multiple AI providers through a consistent interface. Seamlessly switch between models without code
        changes using our lightweight yet powerful package.
      </>
    ),
  },
  {
    title: 'Real-time Streaming',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
      </svg>
    ),
    description: (
      <>
        First-class support for streaming responses with accumulated results, making real-time applications simple to
        build.
      </>
    ),
  },
  {
    title: 'Cost & Usage Tracking',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2"></rect>
        <path d="M3 9h18"></path>
        <path d="M9 21V9"></path>
        <path d="M15 12v3"></path>
        <path d="M15 18v.01"></path>
      </svg>
    ),
    description: (
      <>
        Integrated token usage and cost tracking across all providers, with comprehensive analytics designed for both
        experimental and production applications.
      </>
    ),
  },
];

const dhenaraDadFeatures: FeatureItem[] = [
  {
    title: 'Intuitive Agent DSL',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
        <path d="M10 7h4M7 10v4M17 10v4M10 17h4"></path>
      </svg>
    ),
    description: (
      <>
        Build sophisticated agent workflows by composing reusable components with a clean, programming language-like
        approach.
      </>
    ),
  },
  {
    title: 'Comprehensive Observability',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="2"></circle>
        <path d="M12 8v-2"></path>
        <path d="M12 18v-2"></path>
        <path d="M8 12h-2"></path>
        <path d="M18 12h-2"></path>
      </svg>
    ),
    description: (
      <>
        Free, Built-in Opentelemetry OpenTelemetry-based logging, tracing, and metrics collection for all agent
        activities, without subscriptions and payments.
      </>
    ),
  },
  {
    title: 'Powerful Template Engine',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="9" y1="15" x2="15" y2="15"></line>
        <line x1="9" y1="11" x2="12" y2="11"></line>
      </svg>
    ),
    description: (
      <>
        Create sophisticated prompts and operations with dynamic content using variable substitution, conditional
        expressions, and hierarchical references.
      </>
    ),
  },
];

function Feature({ title, description, icon }: FeatureItem) {
  return (
    <div className="feature-item">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <div className="feature-description">{description}</div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className="features">
      <div className="container">
        <div className="row">
          <div className="col col--6 product-section">
            <div className="product-header">
              <h2>Dhenara AI</h2>
              <p>Open-source Python package for streamlined LLM integration across multiple providers</p>
            </div>
            <div className="features-grid">
              {dhenaraiFeatures.map((feature, idx) => (
                <Feature key={idx} {...feature} />
              ))}
            </div>
          </div>
          <div className="col col--6 product-section">
            <div className="product-header">
              <h2>Agent DSL (Deprecated)</h2>
              <p>Archived documentation for the legacy Dhenara Agent DSL (DAD).</p>
            </div>
            <div className="features-grid">
              {dhenaraDadFeatures.map((feature, idx) => (
                <Feature key={idx} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
