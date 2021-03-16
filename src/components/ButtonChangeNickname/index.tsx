import React from "react";
import "./style.scss";
import { Trans } from "react-i18next";

export const ButtonChangeNickname = (props:{onRequestChangeNickname:()=>void}) => {
  return (
    <span onClick={(e)=>{props.onRequestChangeNickname()}}>
      <Trans>Change Nickname</Trans>
    </span>
  );
};
