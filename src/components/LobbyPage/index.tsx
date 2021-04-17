import React, { HTMLAttributes } from "react";
import style from "./style.module.scss";
import classNames from "classnames";
import { Logo } from "components/Logo";

export const LobbyPage: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={classNames(style.lobbyPage, className)} {...props}>
      <SmallLogo/>
      <GithubLink />
      {children}
    </div>
  );
};

export const SmallLogo = () => {
  return  <a href="/"><Logo size="small" className={style.smallLogo} /></a>;
};

export const GithubLink = () => {
  return (
    <a
      className={style.githubLink}
      href="https://github.com/maciejmatu/mosaic"
      target="_blank"
      rel="noopener noreferrer"
    >
      Github
    </a>
  );
};
