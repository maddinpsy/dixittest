import React from "react";
import { RouteComponentProps, useParams, withRouter } from "react-router-dom";
import "./style.scss";
import { Trans } from "react-i18next";
import { LobbyPage, SmallLogo } from "components/LobbyPage";
import { ButtonLang } from "components/ButtonLang";
import { LobbyLink } from "components/LobbyLink";

import { Server } from "boardgame.io";
import { Dixit } from 'Game';
import { LobbyClient } from "boardgame.io/client";


interface GameLobbySetupProps {
  nickname: string
  lobbyClient: LobbyClient

}

interface GameLobbySetupState {
  roomMetadata?: Server.MatchData
  activeRoomPlayer?: {
    playerID: number;
    credential: string;
  }
}



class GameLobbySetupRaw extends React.Component<GameLobbySetupProps & RouteComponentProps<{ id: string }>, GameLobbySetupState>
{
  matchID: string;
  timerID?: number;
  gameRoomFull: boolean = false;

  constructor(props: GameLobbySetupProps & RouteComponentProps<{ id: string }>) {
    super(props);
    this.state = { roomMetadata: undefined }
    this.matchID = props.match.params.id;
    this.loadRoomMetadata = this.loadRoomMetadata.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.findSeatAndJoin = this.findSeatAndJoin.bind(this);
  }
  componentDidMount() {
    this.timerID = window.setInterval(() => this.loadRoomMetadata(), 500);
    if (this.state.roomMetadata) {
      let arPlayerData = Object.entries(this.state.roomMetadata.players);
      this.gameRoomFull = arPlayerData.filter(([key, value]) => !value.name).length === 0;
      //if (this.gameRoomFull) this.props.startGame();
    }
  }

  componentWillUnmount() {
    if (this.timerID) window.clearInterval(this.timerID);
  }

  loadRoomMetadata(): void {
    if (!this.matchID) {
      throw new Error("IllegalState matchID not set");
    }
    if (!Dixit.name) {
      throw new Error("IllegalState game name not set");
    }
    this.props.lobbyClient.getMatch(Dixit.name, this.matchID).then(
      (matchData) => {
        this.setState({ roomMetadata: matchData })
      }
    )
  }

  joinRoom(playerID: number, playerName: string): Promise<string> {
    if (!this.matchID) {
      throw new Error("IllegalState matchID not set");
    }
    if (!Dixit.name) {
      throw new Error("IllegalState game name not set");
    }
    let joinMatchPromise = this.props.lobbyClient.joinMatch(Dixit.name, this.matchID, { playerID: String(playerID), playerName: playerName });
    let credentialsPromise = joinMatchPromise.then((x) => {
      return x.playerCredentials
    });
    return credentialsPromise;
  }

  findSeatAndJoin() {
    if (this.state.roomMetadata) {
      let arPlayerData = Object.entries(this.state.roomMetadata.players).map(([key, value]) => value);

      const emptySeatID = arPlayerData.find(p => !p.name)?.id;
      const alreadyJoined = arPlayerData.find(p => {
        return p.id === this.state.activeRoomPlayer?.playerID && p.name === this.props.nickname;
      });

      if (!alreadyJoined && emptySeatID !== undefined && this.props.nickname && this.matchID) {
        this.joinRoom(emptySeatID, this.props.nickname);
      }
    }
  }

  render() {
    let arPlayerData: Server.PlayerMetadata[] = [];
    if (this.state.roomMetadata) {
      arPlayerData = Object.entries(this.state.roomMetadata.players).map(([key, value]) => value);
    }

    return (
      <LobbyPage>
        <SmallLogo />
        <ButtonLang />

        <div className="Lobby__title">
          <Trans>Invite Players</Trans>
        </div>
        <div className="Lobby__subtitle">
          <Trans>Send a link to your friends to invite them to your game</Trans>
        </div>
        <LobbyLink />

        <div className="Lobby__players">
          {this.state.roomMetadata ? (
            arPlayerData.map((player) => {
              return player.name ? (
                <div
                  key={player.id}
                  className="Lobby__player Lobby__player--active"
                >
                  {player.name} {player.name === this.props.nickname && "(You)"}
                </div>
              ) : (
                  <div
                    key={player.id}
                    className="Lobby__player Lobby__player--inactive"
                  >
                    <Trans>Waiting for player...</Trans>
                  </div>
                );
            })
          ) : (
              <Trans>Loading...</Trans>
            )}
        </div>
        <div className="Lobby__status-message">
          {this.gameRoomFull ? (
            <Trans>Starting Game...</Trans>
          ) : (
              <Trans>Game will start when all players join!</Trans>
            )}
        </div>
      </LobbyPage >
    );
  }
};
export const GameLobbySetup = withRouter(GameLobbySetupRaw)

/*
export const GameLobbyPlay = () => {
  const { id } = useParams();
  const activeRoomPlayer = useStoreState((s) => s.activeRoomPlayer);

  return (
    <GameClient
      gameID={id}
      playerID={String(activeRoomPlayer?.playerID)}
      credentials={activeRoomPlayer?.credential}
      debug={!isProduction}
    />
  );
};

export const GameLobbySpectator = () => {
  const { id } = useParams();

  return <GameClient gameID={id} />;
};
 */