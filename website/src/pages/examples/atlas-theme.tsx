import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";

import Map from "@site/src/components/AtlasTheme";
import Source from "!!raw-loader!@site/src/components/AtlasTheme";
import styles from "./styles.module.css";

export default function AtlasThemeExample(): JSX.Element {
  return (
    <Layout title="Atlas theme example">
      <main id="main-content" className={styles.main}>
        <Map />
        <div className={styles.code}>
          <CodeBlock className="language-tsx">{Source}</CodeBlock>
        </div>
      </main>
    </Layout>
  );
}
