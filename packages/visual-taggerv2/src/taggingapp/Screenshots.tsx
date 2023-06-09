import { useState } from "react";
import { Image } from "antd";
import Section from "../common/components/core/Section";
import { Css, Flex } from "../common/styles/common.styles";

type ScreenshotProps = {
  screenshot: string;
};
const Screenshots = ({ screenshot }: ScreenshotProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <Section title="Screenshot" expandable={true} defaultExpanded={false}>
      <Flex.Col className={Css.padding(8)}>
        <Image
          preview={{ visible: false }}
          width={120}
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
      </Flex.Col>
    </Section>
  );
};

export default Screenshots;
