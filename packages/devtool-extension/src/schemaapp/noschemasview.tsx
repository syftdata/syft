import Button from "../common/components/core/Button/Button";
import { Css, Flex } from "../common/styles/common.styles";
import { Mono } from "../common/styles/fonts";
import { createTab } from "../common/utils";
import { getConstants } from "../constants";

const NoSchemasView = () => {
  const addEventModel = async () => {
    const constants = await getConstants();
    await createTab(constants.WebAppUrl);
  };
  return (
    <Flex.Col alignItems="center" className={Css.margin("36px 0px")}>
      <Button onClick={addEventModel} type="Primary" size="large">
        Add Event Model
      </Button>
      <Mono.M14>No Event Models found in your Catalog.</Mono.M14>
    </Flex.Col>
  );
};
export default NoSchemasView;
