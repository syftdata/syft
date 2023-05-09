import LoginView from "../cloud/views/LoginView";
import { Css, Flex } from "../common/styles/common.styles";
import LoginInfo from "../cloud/views/LoginInfo";
import PageBody from "../common/components/core/Page/PageBody";
import { Colors } from "../common/styles/colors";
import { useUserSession } from "../cloud/state/usersession";
import { useEffect } from "react";
import { fetchGitInfo } from "../cloud/api/git";
import { GitView } from "../cloud/views/gitview";

const SettingsApp = () => {
  const [userSession] = useUserSession();

  useEffect(() => {
    if (userSession != null) {
      fetchGitInfo(userSession);
    }
  }, [userSession]);

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
