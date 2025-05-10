import React, { JSX } from 'react';
import HomepageHero from './HomepageHero';
import HomepageFeatures from './HomepageFeatures';
import HomepageQuickStart from './HomepageQuickStart';
import HomepageFooterCTA from './HomepageFooterCTA';

export default function HomepageContent(): JSX.Element {
  return (
    <main>
      <HomepageHero />
      <HomepageFeatures />
      <HomepageQuickStart />
      <HomepageFooterCTA />
    </main>
  );
}
