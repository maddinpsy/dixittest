import React from 'react';
import './App.css';
import { Dixit } from './Game';
import {
  BrowserRouter,
  Route,
  Switch
} from "react-router-dom";
import { CreateGame } from 'components/CreateGame';
import { LobbyClient } from 'boardgame.io/client';
import { NicknameProps} from 'components/NicknameOverlay';



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


export class App extends React.Component<NicknameProps, AppState>
{
  lobbyClient: LobbyClient;
  constructor(props: NicknameProps) {
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
    let matchID = this.state.matchID;
    return (
      <div className="App" >
        <BrowserRouter>
        <Switch>
          <Route exact path="/">
              <CreateGame {...this.props} onCreateGameRoom={this.newGame} roomID={matchID} />
          </Route>

          <Route path="/rooms/:id">
            <span>Test Hallo Welt</span>
            {/*<GameLobby />*/}
          </Route>

          <Route path="/rooms/:id/watch/:watchId">
            {/*<GameLobbySpectator />*/}
          </Route>
          <Route path="/">
              Defualt 
          </Route>
        </Switch>
        </BrowserRouter>
      </div>
    );
  }
}
