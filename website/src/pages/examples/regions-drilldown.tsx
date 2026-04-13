import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import styles from "./styles.module.css";

import Map from "@site/src/components/RegionsDrilldown";
import Source from "!!raw-loader!@site/src/components/RegionsDrilldown";

export default function RegionsDrilldown(): JSX.Element {
  return (
    <Layout title="Regions showcase example">
      <main id="main-content" className={styles.main}>
        <Map />
        <p className={styles.exampleNote}>
          This featured example opens in <code>xl</code> size and starts in
          region detail for the United States. Use the accessible zoom gauge to
          switch back to countries with <code>Zoom out</code>, or return to
          regions with <code>Zoom in</code>. This example explicitly turns on
          <code>showLabels</code>; the default library behavior remains no
          automatic labels.
        </p>
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </main>
    </Layout>
  );
}
