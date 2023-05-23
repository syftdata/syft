import { css } from "@emotion/css";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BellIcon,
  BookIcon,
  BoxIcon,
  ChartIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  CloudIcon,
  CodeIcon,
  ColumnsHorizontalIcon,
  EditIcon,
  FolderIcon,
  FloppyDiscIcon,
  GlobeIcon,
  HelpIcon,
  HomeIcon,
  LayersIcon,
  MinusCircleIcon,
  PlayIcon,
  PlusIcon,
  PlusCircleIcon,
  RefreshIcon,
  SearchIcon,
  ServerIcon,
  SettingsIcon,
  SpinnerIcon,
  StarIcon,
  StickerIcon,
  TrashIcon,
  VideoCameraIcon,
  VideoCameraOffIcon,
  WarningTriangleIcon,
  PauseIcon,
  CopyIcon,
} from "@iconicicons/react";
import type { Size } from "../../../constants/types";
import { Colors } from "../../../styles/colors";
import { iconStyles } from "./icon.styles";

export type IconName =
  | "arrow-left"
  | "arrow-right"
  | "arrow-down"
  | "columnsHorizontal"
  | "folder"
  | "globe"
  | "settings"
  | "box"
  | "bell"
  | "chevron-right"
  | "chevron-left"
  | "chevron-up"
  | "chevron-down"
  | "check"
  | "check-circle"
  | "sticker"
  | "star"
  | "home"
  | "edit"
  | "chart"
  | "spinner"
  | "arrow-up-right"
  | "close"
  | "plus"
  | "trash"
  | "warning-triangle"
  | "refresh"
  | "server"
  | "help"
  | "cloud"
  | "book"
  | "layers"
  | "code"
  | "minus-circle"
  | "search"
  | "video-camera"
  | "video-camera-off"
  | "play"
  | "pause"
  | "floppy-disc"
  | "plus-circle"
  | "copy"
  | "github"
  | "notebook";

const getIcon = (icon: IconName) => {
  switch (icon) {
    case "arrow-left":
      return <ArrowLeftIcon />;
    case "arrow-right":
      return <ArrowRightIcon />;
    case "arrow-down":
      return <ArrowDownIcon />;
    case "columnsHorizontal":
      return <ColumnsHorizontalIcon />;
    case "folder":
      return <FolderIcon />;
    case "globe":
      return <GlobeIcon />;
    case "settings":
      return <SettingsIcon />;
    case "box":
      return <BoxIcon />;
    case "bell":
      return <BellIcon />;
    case "chevron-right":
      return <ChevronRightIcon />;
    case "chevron-left":
      return <ChevronLeftIcon />;
    case "chevron-up":
      return <ChevronUpIcon />;
    case "chevron-down":
      return <ChevronDownIcon />;
    case "check":
      return <CheckIcon />;
    case "check-circle":
      return <CheckCircleIcon />;
    case "sticker":
      return <StickerIcon />;
    case "star":
      return <StarIcon />;
    case "home":
      return <HomeIcon />;
    case "edit":
      return <EditIcon />;
    case "chart":
      return <ChartIcon />;
    case "spinner":
      return <SpinnerIcon />;
    case "arrow-up-right":
      return <ArrowUpRightIcon />;
    case "close":
      return <CloseIcon />;
    case "plus":
      return <PlusIcon />;
    case "trash":
      return <TrashIcon />;
    case "warning-triangle":
      return <WarningTriangleIcon />;
    case "refresh":
      return <RefreshIcon />;
    case "server":
      return <ServerIcon />;
    case "help":
      return <HelpIcon />;
    case "cloud":
      return <CloudIcon />;
    case "book":
      return <BookIcon />;
    case "layers":
      return <LayersIcon />;
    case "code":
      return <CodeIcon />;
    case "minus-circle":
      return <MinusCircleIcon />;
    case "search":
      return <SearchIcon />;
    case "video-camera":
      return <VideoCameraIcon />;
    case "video-camera-off":
      return <VideoCameraOffIcon />;
    case "play":
      return <PlayIcon />;
    case "pause":
      return <PauseIcon />;
    case "floppy-disc":
      return <FloppyDiscIcon />;
    case "plus-circle":
      return <PlusCircleIcon />;
    case "copy":
      return <CopyIcon />;
    case "box":
      return <BoxIcon />;
    case "notebook":
      return <BookIcon />;
  }
};

export interface IconProps {
  icon: IconName;
  color?: string;
  size?: Size;
  className?: string;
}

const Icon = ({
  icon,
  color = Colors.Gray.V9,
  size = "small",
  className,
}: IconProps) => {
  return (
    <div className={css(iconStyles.icon(color, size), className)}>
      {getIcon(icon)}
    </div>
  );
};

export default Icon;
