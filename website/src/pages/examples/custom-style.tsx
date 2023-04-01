import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";

import Map from "@site/src/components/CustomStyle";
import Source from "!!raw-loader!@site/src/components/CustomStyle";
import styles from "./styles.module.css";

export default function CustomStyle(): JSX.Element {
  return (
    <Layout title="Custom styles example">
      <div className={styles.main}>
        <Map />
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </div>
    </Layout>
  );
}
