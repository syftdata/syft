import Tabs from "antd/lib/tabs";
import { Colors } from "../../styles/colors";
import { useEffect, useState } from "react";
import Icon from "./Icon/Icon";
import { IconButton } from "./Button/IconButton";
import { css } from "@emotion/css";

export interface SectionProps {
  title: string;
  children: React.ReactNode;
  extraButtons?: React.ReactNode;
  className?: string;

  expandable?: boolean;
  defaultExpanded?: boolean;
}

const Section = ({
  title,
  children,
  className,
  extraButtons,
  expandable,
  defaultExpanded = true,
}: SectionProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const showChildren = !expandable || expanded;
  const slots = {
    left: expandable ? (
      <IconButton
        icon={expanded ? "chevron-down" : "chevron-right"}
        onClick={toggleExpanded}
      />
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
      className={`${className} syft-section`}
    />
  );
};

export default Section;
