import LoginView from "../cloud/views/LoginView";
import { Css, Flex } from "../common/styles/common.styles";
import LoginInfo from "../cloud/views/logininfo";
import PageBody from "../common/components/core/Page/PageBody";
import { Colors } from "../common/styles/colors";
import { useUserSession } from "../cloud/state/usersession";

const SettingsApp = () => {
  const [userSession] = useUserSession();
  return (
    <Flex.Col>
      <PageBody className={Css.background(Colors.White)}>
        {!userSession ? (
          <LoginView />
        ) : (
          <Flex.Col gap={10}>
            <LoginInfo />
          </Flex.Col>
        )}
      </PageBody>
    </Flex.Col>
  );
};
export default SettingsApp;
