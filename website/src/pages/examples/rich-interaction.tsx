import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";

import Map from "@site/src/components/RichInteraction";
import Source from "!!raw-loader!@site/src/components/RichInteraction";
import styles from "./styles.module.css";

export default function RichInteraction(): JSX.Element {
  return (
    <Layout title="Rich interactions example">
      <div className={styles.main}>
        <Map />
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </div>
    </Layout>
  );
}
