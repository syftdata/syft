import Button from "../../common/components/core/Button/Button";
import LabelledValue from "../../common/components/core/LabelledValue/LabelledValue";
import LabelledTile from "../../common/components/core/Tile/LabelledTile";
import { Flex } from "../../common/styles/common.styles";
import { Subheading } from "../../common/styles/fonts";
import { useUserSession } from "../state/usersession";

const LoginInfo = () => {
  const [userSession, setUserSession] = useUserSession();
  if (userSession == null) {
    return <></>;
  }

  const user = userSession.user;
  return (
    <LabelledTile label="User Details" className={Flex.grow(1)}>
      <Flex.Col gap={10}>
        <LabelledValue label="Name" value={user.name ?? "Unknown"} />
        <LabelledValue label="Email" value={user.email ?? "Unknown"} />
        <Flex.Row justifyContent="end">
          <Button type="Primary" onClick={() => setUserSession(undefined)}>
            <Subheading.SH12>Sign out</Subheading.SH12>
          </Button>
        </Flex.Row>
      </Flex.Col>
    </LabelledTile>
  );
};

export default LoginInfo;
