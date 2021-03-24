import React from "react";
import { LobbyPage } from "components/LobbyPage";
import { Logo } from "components/Logo";
import { ButtonLink } from "components/Button";
import { Trans } from "react-i18next";
import style from "./style.module.scss";

export const Welcome = () => {
  return (
    <LobbyPage>
      <Logo className={style.logo} size="large" />
      <p className={style.text}>
        <Trans>
        „DiXit“ is a quess- and communication game, where you give free rein to your imagination.
        One player is the storyteller and makes up a phrase for her handcards – the others choose a card from there hand and guess which picture was the storyteller's.
        </Trans>
      </p>
      <ButtonLink to="/create" theme="orange">
        <Trans>Go!</Trans>
      </ButtonLink>
    </LobbyPage>
  );
};
