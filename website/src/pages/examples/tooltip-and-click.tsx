import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";

import Map from "@site/src/components/TooltipAndClick";
import Source from "!!raw-loader!@site/src/components/TooltipAndClick";
import styles from "./styles.module.css";

export default function TooltipAndClickExample(): JSX.Element {
  return (
    <Layout title="Tooltip + Click (interaction repro)">
      <div className={styles.main}>
        <Map />
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </div>
    </Layout>
  );
}
