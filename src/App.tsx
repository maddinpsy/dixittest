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

interface AppState {
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
    if (!Dixit.name) {
      throw new Error("IllegalState game name not set");
    }
    this.lobbyClient.createMatch(Dixit.name, { numPlayers: playerCount })
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
              <Welcome />
            </Route>

            <Route exact path="/create">
              <CreateGame {...this.props} onCreateGameRoom={this.newGame} roomID={matchID} />
            </Route>

            <Route exact path="/rooms/:id">
              <GameLobbySetup nickname={this.props.nickname} lobbyClient={this.lobbyClient} />
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
