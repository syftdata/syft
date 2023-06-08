import Tabs from "antd/lib/tabs";
import { Colors } from "../../styles/colors";
import { useEffect, useState } from "react";

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  extraButtons?: React.ReactNode;
  className?: string;

  expandable?: boolean;
  isExpanded?: boolean;
}

const Section = ({
  title,
  children,
  className,
  extraButtons,
  expandable,
  isExpanded,
}: SectionProps) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);

  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: "1",
          label: title,
          children: !expandable || expanded ? children : null,
        },
      ]}
      size="small"
      tabBarStyle={{
        marginBottom: 0,
        backgroundColor: Colors.Gray.V1,
        paddingLeft: 8,
        borderBottom: `1px solid ${Colors.Gray.V3}`,
      }}
      onClick={expandable ? toggleExpanded : undefined}
      tabBarExtraContent={extraButtons}
      className={className}
    />
  );
};

export default Section;
