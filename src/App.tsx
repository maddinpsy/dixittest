import React from 'react';
import { Client, Lobby } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import './App.css';
import { DixitBoard } from './Board';
import { Dixit } from './Game';
import {
  Router,
  Route,
  Switch
} from "react-router-dom";
import { createBrowserHistory } from "history";
import { Welcome } from "./components/Welcome";
import { CreateGame } from 'components/CreateGame';
import { LobbyClient } from 'boardgame.io/client';
import { InjectedProps, NicknameHOC } from 'components/SetupNickname/NicknameHOC';



export interface Player {
  id: number;
  name?: string;
}

export interface RoomMetadata {
  players: Player[];
}

export interface JoinRoomParams {
  roomID: string;
  playerID: number;
  playerName: string;
}
/*
async joinRoom({
  roomID,
  ...json
}: JoinRoomParams): Promise<{ playerCredentials: string }> {
  const { playerCredentials } = await this.api
    .post(roomID + "/join", {
      json: json
    })
    .json<{ playerCredentials: string }>();

  return {
    playerCredentials
  };
}

async getRoomMetadata(roomID: string): Promise<RoomMetadata> {
  return await this.api.get(roomID).json<{ players: Player[] }>();
}
*/


interface AppState {
  roomMetaData?: any
  matchID?: string
}


class RawApp extends React.Component<InjectedProps, AppState>
{
  lobbyClient: LobbyClient;
  constructor(props: InjectedProps) {
    super(props);
    this.lobbyClient = new LobbyClient({ server: 'http://localhost:8000' });
    this.state = {}
    this.newGame = this.newGame.bind(this);
  }

  newGame(playerCount: number) {
    this.lobbyClient.createMatch(Dixit.name || "", { numPlayers: playerCount })
      .then((x) => { this.setState({ matchID: x.matchID }) })
      .catch((reason) => console.log("Error creating new Game:" + reason));
  }

  render() {
    let nickname = this.props.nickname;
    let matchID = this.state.matchID;
    const history = createBrowserHistory();
    return (
      <div className="App" >
        <Router history = {history}>
        <Switch>
          {/* TODO: Use modal for nickname creation instead of conditional rendering */}
          <Route exact path="/">
            <Welcome />
          </Route>

          <Route exact path="/create">
              <CreateGame nickname={nickname} onRequestChangeNickname={this.props.requestChangeNickname} onCreateGameRoom={this.newGame} roomID={matchID} />
          </Route>

          <Route exact path="/rooms/:id">
            {/*nickname ? <GameLobby /> : <SetupNickname />*/}
          </Route>

          <Route path="/rooms/:id/watch/:watchId">
            {/*<GameLobbySpectator />*/}
          </Route>

        </Switch>
        </Router>
      </div>
    );
  }
}

export default NicknameHOC(RawApp);
