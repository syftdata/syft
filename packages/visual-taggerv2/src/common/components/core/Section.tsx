import Tabs from "antd/lib/tabs";
import { Colors } from "../../styles/colors";
import { useEffect, useState } from "react";
import Icon from "./Icon/Icon";

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

  const showChildren = !expandable || expanded;
  const slots = {
    left: expandable ? (
      <Icon icon={expanded ? "chevron-down" : "chevron-right"} />
    ) : undefined,
    right: extraButtons,
  };
  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: "1",
          label: title,
          children: showChildren ? children : null,
        },
      ]}
      size="small"
      tabBarStyle={{
        marginBottom: 0,
        backgroundColor: Colors.Gray.V1,
        paddingLeft: expandable ? 0 : 8,
      }}
      onTabClick={expandable ? toggleExpanded : undefined}
      tabBarExtraContent={slots}
      className={className}
    />
  );
};

export default Section;
