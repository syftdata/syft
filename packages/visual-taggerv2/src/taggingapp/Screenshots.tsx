import { useState } from "react";
import { Image } from "antd";
import { Css, Flex } from "../common/styles/common.styles";

type ScreenshotProps = {
  screenshot: string;
};
const Screenshots = ({ screenshot }: ScreenshotProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <Flex.Col className={Css.padding(8)}>
      <Image
        preview={{ visible: false }}
        width={64}
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
  );
};

export default Screenshots;
