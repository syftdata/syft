import { motion } from "framer-motion";
import Icon from "../Icon/Icon";
import { Css } from "../../../styles/common.styles";
import { css } from "@emotion/css";

interface SpinnerProps {
  color?: string;
}
const Spinner = ({ color }: SpinnerProps) => {
  return (
    <motion.div
      animate={{
        transform: ["rotate(0deg)", "rotate(360deg)"],
      }}
      transition={{ repeat: Infinity, duration: 2 }}
      className={css(Css.width(25), Css.centerCss)}
    >
      <Icon icon="spinner" size="medium" color={color} />
    </motion.div>
  );
};

export default Spinner;
