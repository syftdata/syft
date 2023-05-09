import { Css, Flex } from "../../common/styles/common.styles";
import { Paragraph } from "../../common/styles/fonts";
import { initiateLoginFlow } from "../api/auth";
import Button from "../../common/components/core/Button/Button";

const LoginView = () => {
  return (
    <Flex.Col gap={10} alignItems="center" className={Css.margin("36px 0px")}>
      <Paragraph.P14>Please Login to collaborate with your team.</Paragraph.P14>
      <Button onClick={initiateLoginFlow} type="Primary" size="large">
        Sign In
      </Button>
    </Flex.Col>
  );
};
export default LoginView;
