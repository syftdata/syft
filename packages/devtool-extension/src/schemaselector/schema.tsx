import { css } from "@emotion/css";
import { Colors } from "../common/styles/colors";
import { Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { EventField, EventSchema } from "../types";

const FieldRenderer = ({ val }: { val: EventField }) => {
  return (
    <Flex.Row
      gap={2}
      className={css`
        padding-left: 48px;
        padding-right: 10px;
      `}
    >
      <Mono.M12 color={Colors.Branding.DarkBlue}>{val.name}</Mono.M12>
      <Mono.M10>{val.documentation}</Mono.M10>
      <input type="text" />
    </Flex.Row>
  );
};

const SchemaPropsRenderer = ({ data }: { data: EventSchema }) => {
  return (
    <Flex.Col gap={4}>
      {data.fields.map((field, index) => (
        <FieldRenderer key={index} val={field} />
      ))}
    </Flex.Col>
  );
};
export default SchemaPropsRenderer;
