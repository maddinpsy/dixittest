import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import "./style.scss";
import { Trans } from "react-i18next";
import { LobbyPage, SmallLogo } from "components/LobbyPage";
import { ButtonLang } from "components/ButtonLang";
import { LobbyLink } from "./LobbyLink";

import { Server } from "boardgame.io";
import { Dixit } from 'Game';
import { LobbyClient } from "boardgame.io/client";
import { StoredPlayerData } from "App";


interface GameLobbySetupBasicProps {
  nickname: string
  lobbyClient: LobbyClient
  playerData?: StoredPlayerData
  storePlayerData:(activeRoomPlayer: StoredPlayerData)=>void
  startGame:(metadata:Server.MatchData)=>void
}

interface GameLobbySetupState {
  roomMetadata?: Server.MatchData
}

type GameLobbySetupProps = GameLobbySetupBasicProps & RouteComponentProps<{ id: string }>


class GameLobbySetupRaw extends React.Component<GameLobbySetupProps, GameLobbySetupState>
{
  matchID: string;
  timerID?: number;
  gameRoomFull: boolean = false;

  constructor(props: GameLobbySetupProps) {
    super(props);
   
    this.state = { roomMetadata: undefined }
    //get matchID from url
    this.matchID = props.match.params.id;
    this.loadRoomMetadata = this.loadRoomMetadata.bind(this);
    this.findSeatAndJoin = this.findSeatAndJoin.bind(this);
    this.join = this.join.bind(this);
  }

  componentDidMount() {
    this.timerID = window.setInterval(() => this.loadRoomMetadata(), 500);

  }

  componentWillUnmount() {
    if (this.timerID) window.clearInterval(this.timerID);
  }

  componentDidUpdate(prevProps: GameLobbySetupProps, prevState: GameLobbySetupState) {
    // Typical usage (don't forget to compare props):
    if (this.state.roomMetadata && this.state.roomMetadata !== prevState.roomMetadata) {
      this.findSeatAndJoin();

      let arPlayerData = Object.entries(this.state.roomMetadata.players).map(([key, value]) => value);
      this.gameRoomFull = arPlayerData.filter((value) => !value.name).length === 0;
      const alreadyJoined = arPlayerData.find(p => {
        return p.id === this.props.playerData?.playerID && p.name === this.props.nickname;
      });
      if (this.gameRoomFull) {
        if(alreadyJoined){
          this.delayedStart();
        }else{
          alert(
            "This game started without you."
          );
          this.props.history.push("/");
          return;
        }
      }
    }
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
    ).catch((e)=>{
      alert(
        "There was a problem. Make sure you have the right url and try again."
      );
      console.log("Error in loadRoomMetadata: "+e);
      this.props.history.push("/");
      return;
    });
  }

  join(playerID: number) {
    if (!Dixit.name) {
      throw new Error("IllegalState game name not set");
    }
    //call server api to join
    let joinMatchPromise = this.props.lobbyClient.joinMatch(Dixit.name, this.matchID, { playerID: String(playerID), playerName: this.props.nickname });
    //on success: store credentions
    joinMatchPromise.then(
      (joinedRoom) => {
        this.props.storePlayerData({
          playerID: playerID,
          credential: joinedRoom.playerCredentials,
          matchID: this.matchID
        });
      }
    );
    //log error
    joinMatchPromise.catch(
      (error) => {
        alert(
          "There was a problem. Make sure you have the right url and try again."
        );
        console.log("Error joining room:" + error);
        this.props.history.push("/");
        return;
      }
    );
  }

  findSeatAndJoin() {
    if (!this.matchID) {
      throw new Error("IllegalState matchID not set");
    }
    if (!Dixit.name) {
      throw new Error("IllegalState game name not set");
    }
    if (!this.state.roomMetadata) {
      throw new Error("IllegalState roomMetadata not set");
    }

    let arPlayerData = Object.entries(this.state.roomMetadata.players).map(([key, value]) => value);

    const emptySeatID = arPlayerData.find(p => !p.name)?.id;
    const alreadyJoined = arPlayerData.find(p => {
      return p.id === this.props.playerData?.playerID && p.name === this.props.nickname;
    });

    if (!alreadyJoined && emptySeatID !== undefined && this.props.nickname && this.matchID) {
      this.join(emptySeatID);
    }
  }

  delayedStart(){
    window.setTimeout(()=>{
      if(this.state.roomMetadata)
      {
        this.props.startGame(this.state.roomMetadata);
      }else{
        alert("There was an internal problem. Please try again.");
        this.props.history.push("/");
        return; 
      }
    },2000);
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
