import Button from "../common/components/core/Button/Button";
import { Css, Flex } from "../common/styles/common.styles";
import { Paragraph, Subheading } from "../common/styles/fonts";
import { createTab } from "../common/utils";
import { constants } from "../constants";

const NoSchemasView = () => {
  const addEventModel = async () => {
    await createTab(constants.AddSchemaUrl);
  };
  return (
    <Flex.Col gap={8} alignItems="center" className={Css.margin("36px 0px")}>
      <Paragraph.P14>No Event Models found in your Catalog.</Paragraph.P14>
      <Button onClick={addEventModel} type="Primary">
        <Subheading.SH12>Add Event Model</Subheading.SH12>
      </Button>
    </Flex.Col>
  );
};
export default NoSchemasView;
