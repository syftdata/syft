import { Css, Flex } from "../../common/styles/common.styles";
import { Paragraph, Subheading } from "../../common/styles/fonts";
import { initiateLoginFlow } from "../api/auth";
import Button from "../../common/components/core/Button/Button";
import { Colors } from "../../common/styles/colors";

const LoginView = () => {
  return (
    <Flex.Col gap={10} alignItems="center" className={Css.margin("36px 0px")}>
      <Paragraph.P14>Please Login to collaborate with your team.</Paragraph.P14>
      <Button onClick={initiateLoginFlow} type="Primary" size="large">
        <Subheading.SH14>Sign In</Subheading.SH14>
      </Button>
      <a href="https://www.syftdata.com/">
        <Button type="Clear" size="small">
          <Paragraph.P12 color={Colors.Gray.V5}>More info</Paragraph.P12>
        </Button>
      </a>
    </Flex.Col>
  );
};
export default LoginView;
