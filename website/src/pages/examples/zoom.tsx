import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";

import Map from "@site/src/components/Zoom";
import Source from "!!raw-loader!@site/src/components/Zoom";
import styles from "./styles.module.css";

export default function ZoomExample(): JSX.Element {
  return (
    <Layout title="Zoom, pins and labels example">
      <main id="main-content" className={styles.main}>
        <Map />
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </main>
    </Layout>
  );
}
