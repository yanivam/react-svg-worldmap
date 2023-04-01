import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";

import Map from "@site/src/components/StringValue";
import Source from "!!raw-loader!@site/src/components/StringValue";
import styles from "./styles.module.css";

export default function StringValue(): JSX.Element {
  return (
    <Layout title="String Value example">
      <div className={styles.main}>
        <Map />
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </div>
    </Layout>
  );
}
