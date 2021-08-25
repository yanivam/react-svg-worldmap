import React from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';

import Map from '../../components/Links';
import Source from '!!raw-loader!../../components/Links';
import styles from './styles.module.css';

export default function () {
  return (
    <Layout title={'Href binding example'}>
      <div className={styles.main}>
        <Map />
        <div className={styles.code}>
          <CodeBlock className={'language-tsx'}>
            {Source}
          </CodeBlock>
        </div>
      </div>
    </Layout>
  );
}
