import React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

import styles from "./styles.module.css";

const sizes = ["SM", "MD", "LG", "XL", "XXL", "Responsive", "Numeric"];
const Maps: Record<string, () => JSX.Element> = {};
const Sources: Record<string, string> = {};
sizes.forEach((size) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  Maps[size] = require(`@site/src/components/sizing/${size}`).default;
  Sources[size] =
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    require(`!!raw-loader!@site/src/components/sizing/${size}`).default;
});

export default function Sizing(): JSX.Element {
  return (
    <Layout title="Sizing examples">
      <div className={styles.main}>
        <Tabs
          values={sizes.map((size) => ({
            label: size,
            value: size.toLowerCase(),
          }))}
          defaultValue="sm"
          className={styles.tabsContainer}>
          {sizes.map((size) => {
            const Map = Maps[size];
            return (
              <TabItem value={size.toLowerCase()} key={size}>
                <Map />
                <div className={styles.code}>
                  <CodeBlock className="language-tsx">
                    {Sources[size]}
                  </CodeBlock>
                </div>
              </TabItem>
            );
          })}
        </Tabs>
      </div>
    </Layout>
  );
}
