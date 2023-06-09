import { useState } from "react";
import { Image } from "antd";
import Section from "../common/components/core/Section";

type ScreenshotProps = {
  screenshot: string;
};
const Screenshots = ({ screenshot }: ScreenshotProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <Section title="Screenshot" expandable={true} defaultExpanded={false}>
      <Image
        preview={{ visible: false }}
        width={200}
        src={screenshot}
        onClick={() => setVisible(true)}
      />
      <div style={{ display: "none" }}>
        <Image.PreviewGroup
          preview={{ visible, onVisibleChange: (vis) => setVisible(vis) }}
        >
          <Image src={screenshot} />
        </Image.PreviewGroup>
      </div>
    </Section>
  );
};

export default Screenshots;
