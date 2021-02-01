import React from 'react';
import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer';
import './App.css';
import {DixitBoard} from './Board';
import {Dixit} from './Game';

function App() {
  const DixitClient = Client({
    game: Dixit,
    board: DixitBoard,
    multiplayer: Local(),
  });
  return (
    <DixitClient playerID="0" />
  );
}

export default App;
