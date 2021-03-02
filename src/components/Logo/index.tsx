import React from "react";
import logo from "assets/dixit_logo.png";
import "./style.scss";
import classNames from "classnames";

interface Props {
  size: "small" | "medium" | "large" | "tiny";
  className?: string;
}

export const Logo: React.FC<Props> = ({ size, className, ...props }) => {
  return (
    <img src={logo} alt="Dixit"
      className={classNames("Logo", `Logo--${size}`, className)}
      {...props}
    />
  );
};
