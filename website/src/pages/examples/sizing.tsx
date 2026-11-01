import * as React from "react";
import Layout from "@theme/Layout";
import CodeBlock from "@theme/CodeBlock";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

import SizeExample, {
  type ExampleSize,
} from "@site/src/components/SizeExample";
import Source from "!!raw-loader!@site/src/components/SizeExample";
import styles from "./styles.module.css";

const sizes: { label: string; size: ExampleSize }[] = [
  { label: "SM", size: "sm" },
  { label: "MD", size: "md" },
  { label: "LG", size: "lg" },
  { label: "XL", size: "xl" },
  { label: "XXL", size: "xxl" },
  { label: "Responsive", size: "responsive" },
  { label: "Numeric", size: 400 },
];

export default function Sizing(): JSX.Element {
  return (
    <Layout title="Sizing examples">
      <main id="main-content" className={styles.main}>
        <Tabs
          values={sizes.map(({ label, size }) => ({
            label,
            value: String(size),
          }))}
          defaultValue="sm"
          className={styles.tabsContainer ?? ""}>
          {sizes.map(({ size }) => (
            <TabItem value={String(size)} key={String(size)}>
              <SizeExample size={size} />
              <div className={styles.code}>
                <CodeBlock className="language-tsx">{Source}</CodeBlock>
              </div>
            </TabItem>
          ))}
        </Tabs>
      </main>
    </Layout>
  );
}
