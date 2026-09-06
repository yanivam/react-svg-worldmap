import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";

import Map from "@site/src/components/ZoomExample";
import Source from "!!raw-loader!@site/src/components/ZoomExample";
import styles from "./styles.module.css";

export default function ZoomWithRegions(): JSX.Element {
  return (
    <Layout title="Zoom with regions example">
      <main
        id="main-content"
        className={styles.main}
        data-package-shape="workspace-release">
        <Map />
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </main>
    </Layout>
  );
}
