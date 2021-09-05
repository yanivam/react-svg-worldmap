import React from 'react';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';

import Map from '../../components/TextLabels';
import Source from '!!raw-loader!../../components/TextLabels';
import styles from './styles.module.css';

export default function () {
  return (
    <Layout title={'Text labels example'}>
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
