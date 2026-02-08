import React, { JSX } from 'react';
import Head from '@docusaurus/Head';
import Admonition from '@theme/Admonition';
import { useLocation } from '@docusaurus/router';

import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof ContentType>;

function DeprecatedAgentBanner() {
  return (
    <Admonition type="caution" title="Deprecated: Dhenara Agent DSL (DAD)">
      <p>This documentation is for the legacy Dhenara Agent DSL package. It is no longer actively developed.</p>
      <p>
        For new projects, start with <a href="/dhenara-ai/introduction">Dhenara AI</a>. Existing users may continue
        using Agent DSL as-is.
      </p>
    </Admonition>
  );
}

export default function ContentWrapper(props: Props): JSX.Element {
  const { pathname } = useLocation();
  const isAgentDocs = pathname === '/dhenara-agent' || pathname.startsWith('/dhenara-agent/');

  return (
    <>
      {isAgentDocs && (
        <>
          <Head>
            <meta name="robots" content="noindex,nofollow" />
          </Head>
          <div className="margin-bottom--md">
            <DeprecatedAgentBanner />
          </div>
        </>
      )}
      <Content {...props} />
    </>
  );
}
