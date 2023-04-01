import * as React from "react";
import { type ComponentType } from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

import styles from "./styles.module.css";

const sizes = ["SM", "MD", "LG", "XL", "XXL", "Responsive", "Numeric"] as const;
const Maps = Object.fromEntries(
  sizes.map((size) => [
    size,
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    require(`@site/src/components/sizing/${size}`).default,
  ]),
) as { [size in (typeof sizes)[number]]: ComponentType };
const Sources = Object.fromEntries(
  sizes.map((size) => [
    size,
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
    require(`!!raw-loader!@site/src/components/sizing/${size}`).default,
  ]),
) as { [size in (typeof sizes)[number]]: string };

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
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          className={styles.tabsContainer!}>
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
