import React from 'react';
import './App.css';
import { Dixit } from './Game';
import {
  BrowserRouter,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import { CreateGame } from 'components/CreateGame';
import { LobbyClient } from 'boardgame.io/client';
import { NicknameProps } from 'components/NicknameOverlay';
import { GameLobbySetup } from "components/Lobby";
import { Welcome } from "components/Welcome";
import { Server } from "boardgame.io";

export interface StoredPlayerData {
  playerID: number;
  credential: string;
  matchID: string;
}
interface AppState {
  matchID?: string
  isRunning: boolean
  roomMetadata?: Server.MatchData
  playerData?: StoredPlayerData
}
const CREDENTIALS_STORAGE_KEY = "DIXIT_CLIENT_CREDENTIALS"


export class App extends React.Component<NicknameProps, AppState>
{
  lobbyClient: LobbyClient;
  constructor(props: NicknameProps) {
    super(props);
    this.lobbyClient = new LobbyClient({ server: 'http://localhost:8000' });

    //restore saved credentials
    const encodedCredentials = localStorage.getItem(CREDENTIALS_STORAGE_KEY);
    let storedCredentials: StoredPlayerData | undefined;
    if (encodedCredentials) {
      storedCredentials = JSON.parse(encodedCredentials)
    }

    this.state = { playerData: storedCredentials, isRunning: false }

    this.newGame = this.newGame.bind(this);
    this.storePlayerData = this.storePlayerData.bind(this);
    this.startGame = this.startGame.bind(this);
  }

  newGame(playerCount: number) {
    if (!Dixit.name) {
      throw new Error("IllegalState game name not set");
    }
    this.lobbyClient.createMatch(Dixit.name, { numPlayers: playerCount })
      .then((x) => { this.setState({ matchID: x.matchID }) })
      .catch((reason) => console.log("Error creating new Game:" + reason));
  }

  storePlayerData(activeRoomPlayer: StoredPlayerData) {
    localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(activeRoomPlayer));

    this.setState({
      playerData: activeRoomPlayer
    });
  }

  startGame(roomMetadata: Server.MatchData) {
    this.setState({
      isRunning: true,
      roomMetadata: roomMetadata
    })
  }


  render() {
    let matchID = this.state.matchID;
    
    let roomPage: JSX.Element;
    if (this.state.isRunning) {
      roomPage = <div>Läuft...</div>
    } else {
      roomPage = (<GameLobbySetup
        nickname={this.props.nickname}
        lobbyClient={this.lobbyClient}
        storePlayerData={this.storePlayerData}
        playerData={this.state.playerData}
        startGame={this.startGame}
      />);
    }
    return (
      <div className="App" >
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Welcome />
            </Route>

            <Route exact path="/create">
              <CreateGame {...this.props} onCreateGameRoom={this.newGame} roomID={matchID} />
            </Route>

            <Route exact path="/rooms/:id">
              {roomPage}
            </Route>

            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}
