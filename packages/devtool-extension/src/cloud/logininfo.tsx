import Button from "../common/components/core/Button/Button";
import LabelledValue from "../common/components/core/LabelledValue/LabelledValue";
import LabelledTile from "../common/components/core/Tile/LabelledTile";
import { Flex } from "../common/styles/common.styles";
import { Subheading } from "../common/styles/fonts";
import { signOut } from "../common/utils";
import { LoginResponse } from "../types";

export interface LoginInfoProps {
  className?: string;
  loginResponse?: LoginResponse | null;
}

const LoginInfo = ({ className, loginResponse }: LoginInfoProps) => {
  if (!loginResponse) {
    return <div>Not Logged in</div>;
  }
  const user = loginResponse.session;
  return (
    <LabelledTile label="User Details" className={Flex.grow(1)}>
      <Flex.Col gap={10}>
        <LabelledValue label="Name" value={user.user.name ?? "Unknown"} />
        <LabelledValue label="Email" value={user.user.email ?? "Unknown"} />
        <Flex.Row justifyContent="end">
          <Button type="Primary" onClick={() => void signOut()} size="small">
            <Subheading.SH12>Sign out</Subheading.SH12>
          </Button>
        </Flex.Row>
      </Flex.Col>
    </LabelledTile>
  );
};

export default LoginInfo;
