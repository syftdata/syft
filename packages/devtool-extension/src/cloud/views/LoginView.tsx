import { Css, Flex } from "../../common/styles/common.styles";
import { Mono } from "../../common/styles/fonts";
import { initiateLoginFlow } from "../api/auth";
import Button from "../../common/components/core/Button/Button";

const LoginView = () => {
  return (
    <Flex.Col alignItems="center" className={Css.margin("36px 0px")}>
      <Button onClick={initiateLoginFlow} type="Primary" size="large">
        Sign In
      </Button>
      <Mono.M14>
        Login gives you ability to save recordings to your account.
      </Mono.M14>
    </Flex.Col>
  );
};
export default LoginView;
