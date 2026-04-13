import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import styles from "./styles.module.css";

import Map from "@site/src/components/RegionsDrilldown";
import Source from "!!raw-loader!@site/src/components/RegionsDrilldown";

export default function RegionsDrilldown(): JSX.Element {
  return (
    <Layout title="Regions drill-down example">
      <main id="main-content" className={styles.main}>
        <Map />
        <p className={styles.exampleNote}>
          This example uses <code>detailLevel="regions"</code> with the optional
          regions package so you can inspect the default zoom controls, live
          announcements, and visible-region list.
        </p>
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </main>
    </Layout>
  );
}
