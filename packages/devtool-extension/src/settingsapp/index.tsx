import GitInfo from "../cloud/gitinfo";
import { useLoginSessionState } from "../common/hooks";
import LoginView from "../cloud/LoginView";
import { Css, Flex } from "../common/styles/common.styles";
import LoginInfo from "../cloud/logininfo";
import PageBody from "../common/components/core/Page/PageBody";
import { Colors } from "../common/styles/colors";

const SettingsApp = () => {
  const [loginSession] = useLoginSessionState();
  return (
    <Flex.Col>
      <PageBody className={Css.background(Colors.White)}>
        {!loginSession ? (
          <LoginView />
        ) : (
          <Flex.Col gap={20}>
            <GitInfo loginResponse={loginSession} />
            <LoginInfo loginResponse={loginSession} />
          </Flex.Col>
        )}
      </PageBody>
    </Flex.Col>
  );
};
export default SettingsApp;
