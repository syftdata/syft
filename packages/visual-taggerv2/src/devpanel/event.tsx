import { css } from "@emotion/css";
import { Colors } from "../common/styles/colors";
import { Css, Flex } from "../common/styles/common.styles";
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
      alignItems="center"
      className={css`
        padding-left: 32px;
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
      <Mono.M10 color={Colors.Secondary.Orange}>{valString}</Mono.M10>
    </Flex.Row>
  );
};

const EventPropsRenderer = ({ data }: { data: Record<string, any> }) => {
  return (
    <Flex.Col gap={4} className={Css.margin("0px 0px 4px")}>
      {Object.entries(data).map(([key, val]) => (
        <PropRenderer key={key} keyStr={key} val={val} />
      ))}
    </Flex.Col>
  );
};
export default EventPropsRenderer;
