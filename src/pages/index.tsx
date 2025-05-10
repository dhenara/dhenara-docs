import React, { JSX } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageContent from '../components/HomepageContent';

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Documentation for Dhenara AI and Dhenara Agent DSL"
    >
      <HomepageContent />
    </Layout>
  );
}
