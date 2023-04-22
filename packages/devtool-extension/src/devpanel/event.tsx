import { css } from "@emotion/css";
import { Colors } from "../common/styles/colors";
import { Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";

const PropRenderer = ({ keyStr, val }: { keyStr: string; val: any }) => {
  let valString = val;
  if (val instanceof Date) {
    valString = val.toISOString();
  } else {
    valString = JSON.stringify(val, null, 2);
  }
  return (
    <Flex.Row
      gap={2}
      className={css`
        padding-left: 48px;
        padding-right: 10px;
      `}
    >
      <Mono.M10
        className={css`
          width: 100px;
        `}
        color={Colors.Branding.DarkBlue}
      >
        {keyStr}
      </Mono.M10>
      <Mono.M10 color={Colors.Secondary.Orange}>
        <pre>{valString}</pre>
      </Mono.M10>
    </Flex.Row>
  );
};

const EventPropsRenderer = ({ data }: { data: Record<string, any> }) => {
  return (
    <Flex.Col gap={4}>
      {Object.entries(data).map(([key, val]) => (
        <PropRenderer key={key} keyStr={key} val={val} />
      ))}
    </Flex.Col>
  );
};
export default EventPropsRenderer;
