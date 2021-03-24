import React from "react";
import { Redirect } from "react-router-dom";
import "./style.scss";
import { Trans } from "react-i18next";
import { ButtonLang } from "components/ButtonLang";
import { Button, ButtonProps } from "components/Button";
import { LobbyPage, SmallLogo } from "components/LobbyPage";

interface Props {
  playerCount: number;
  onClick(playerCount: number): void;
}

const CreateGameButton: React.FC<ButtonProps & Props> = ({
  playerCount,
  onClick,
  ...props
}) => {
  return (
    <Button
      className="CreateGameButton"
      onClick={() => onClick(playerCount)}
      {...props}
    >
      <span className="CreateGameButton__count">{playerCount}</span>
      <Trans>Players</Trans>
    </Button>
  );
};

interface CreateGameProps{
  onCreateGameRoom : (playerCount:number)=>void
  requestChangeNickname :() => void
  nickname:string
  roomID?:string
}

export class CreateGame extends React.Component<CreateGameProps> {

  constructor(props:CreateGameProps)
  {
    super(props);
    if(props.nickname.trim()===""){
      props.requestChangeNickname();
    }
  }

  render(){
  
    let nickname = this.props.nickname;
    let roomID = this.props.roomID;

    if (roomID) return <Redirect to={`/rooms/${roomID}`} />;

    return (
      <LobbyPage>
        <SmallLogo />
        <ButtonLang />

        <h3 className="CreateGame__title">
          <Trans>Welcome {{ nickname }}!</Trans>
        </h3>

        <Button onClick={(e)=>{this.props.requestChangeNickname()}}>
          <Trans>Change Nickname</Trans>
        </Button>

        <h3 className="CreateGame__subtitle">
          <Trans>How many players do you want to play with?</Trans>
        </h3>
        <div className="CreateGame__options">
        <CreateGameButton
            theme="orange"
            playerCount={2}
            onClick={this.props.onCreateGameRoom}
          />
          <CreateGameButton
            theme="orange"
            playerCount={4}
            onClick={this.props.onCreateGameRoom}
          />
          <CreateGameButton
            theme="orange"
            playerCount={5}
            onClick={this.props.onCreateGameRoom}
          />
          <CreateGameButton
            theme="orange"
            playerCount={6}
            onClick={this.props.onCreateGameRoom}
          />
        </div>
      </LobbyPage>
    );
  }

}
