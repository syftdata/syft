import { Css, Flex } from "../common/styles/common.styles";
import { Heading, Subheading } from "../common/styles/fonts";

export function RecordDoneHeader() {
  return (
    <Flex.Col gap={4} className={Css.padding(4)}>
      <Flex.Row justifyContent="space-between">
        <Heading.H18>Recording Finished!</Heading.H18>
      </Flex.Row>
      <Flex.Row>
        <Subheading.SH12>
          Below is the generated code for this recording.
        </Subheading.SH12>
      </Flex.Row>
    </Flex.Col>
  );
}
