import * as React from "react";
import "./style.scss";
import { ButtonBack } from "components/ButtonBack";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "components/Button";
import { LobbyPage, SmallLogo } from "components/LobbyPage";
import { ButtonLang } from "components/ButtonLang";
import { Input } from "components/Input";


export class SetupNickname extends React.Component<{ nickname?: string, onSubmit?: (newNickname: string) => void }, { nickname: string }>
{


  constructor(props: any) {
    super(props);
    if (this.props.nickname) {
      this.state = { nickname: this.props.nickname };
    }
    this.handleChanged = this.handleChanged.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChanged(nickname: string) {
    this.setState({ nickname: nickname });
  }

  handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    this.props.onSubmit && this.props.onSubmit(this.state.nickname);
  };
  render() {
    const { t } = useTranslation();
    return (
      <LobbyPage>
        <ButtonBack to="/create" />
        <ButtonLang />
        <SmallLogo />

        <h3 className="SetupNickname__title">
          <Trans>Set your nickname</Trans>
        </h3>

        <form onSubmit={this.handleSubmit} className="SetupNickname__form">
          <Input
            placeholder={t("Type in something cool...")}
            className="SetupNickname__input"
            onChange={(e) => this.handleChanged(e.target.value)}
            value={this.state.nickname}
          />

          <Button type="submit">
            <Trans>Save</Trans>
          </Button>
        </form>
      </LobbyPage>
    );
  }

};
