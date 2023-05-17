import Tabs from "antd/lib/tabs";
import { Colors } from "../../styles/colors";

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section = ({ title, children, className }: SectionProps) => {
  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: "1",
          label: title,
          children,
        },
      ]}
      size="small"
      tabBarStyle={{
        marginBottom: 0,
        backgroundColor: Colors.Gray.V1,
        paddingLeft: 8,
        borderBottom: `1px solid ${Colors.Gray.V3}`,
      }}
      className={className}
    />
  );
};

export default Section;
