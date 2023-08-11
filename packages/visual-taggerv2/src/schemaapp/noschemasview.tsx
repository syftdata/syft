import Button from "../common/components/core/Button/Button";
import Icon from "../common/components/core/Icon/Icon";
import { Colors } from "../common/styles/colors";
import { Css, Flex } from "../common/styles/common.styles";
import { Paragraph, Subheading } from "../common/styles/fonts";

const NoSchemasView = ({ onMagicWand }: { onMagicWand?: () => void }) => {
  return (
    <Flex.Col gap={8} alignItems="center" className={Css.margin("36px 0px")}>
      <Paragraph.P14>
        Or, Magic Wand automagically creates events based on the page content.
      </Paragraph.P14>
      <Button onClick={onMagicWand} type="Primary">
        <Flex.Row gap={8} alignItems="center">
          <Icon size="xSmall" icon="magic-wand" color={Colors.White} />
          <Subheading.SH12 color={Colors.White}>Magic Wand</Subheading.SH12>
        </Flex.Row>
      </Button>
    </Flex.Col>
  );
};
export default NoSchemasView;
