jest.mock('./images')

import { Dixit } from './Game';
import { Local } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/client';

it('plays a whole turn with four multiplayers', () => {
  const spec = {
    game: Dixit,
    numPlayers: 4,
    multiplayer: Local(),
  };

  const p0 = Client({ ...spec, playerID: '0' });
  const p1 = Client({ ...spec, playerID: '1' });
  const p2 = Client({ ...spec, playerID: '2' });
  const p3 = Client({ ...spec, playerID: '3' });

  p0.start();
  p1.start();
  p2.start();
  p3.start();

  //start player is 0
  expect(p0.getState()?.ctx.currentPlayer).toEqual('0');
  //he is in story telling, other are waiting
  expect(p0.getState()?.ctx.activePlayers).toEqual({ '0': 'Storytelling', '1': 'Waiting', '2': 'Waiting', '3': 'Waiting' });

  //check hand cards
  expect(p0.getState()?.G.players['0'].hand.length).toEqual(6);
  expect(p1.getState()?.G.players['1'].hand.length).toEqual(6);
  expect(p2.getState()?.G.players['2'].hand.length).toEqual(6);
  expect(p3.getState()?.G.players['3'].hand.length).toEqual(6);
  //hands are different
  expect(p3.getState()?.G.players['3'].hand).not.toContain(p2.getState()?.G.players['2'].hand[0]);
  expect(p2.getState()?.G.players['2'].hand).not.toContain(p1.getState()?.G.players['1'].hand[2]);
  expect(p1.getState()?.G.players['1'].hand).not.toContain(p0.getState()?.G.players['0'].hand[4]);
  expect(p0.getState()?.G.players['0'].hand).not.toContain(p3.getState()?.G.players['3'].hand[3]);

  //check other hands are hidden
  expect(Object.keys(p0.getState()?.G.players || {}).length).toEqual(1);
  expect(Object.keys(p1.getState()?.G.players || {}).length).toEqual(1);
  expect(Object.keys(p2.getState()?.G.players || {}).length).toEqual(1);
  expect(Object.keys(p3.getState()?.G.players || {}).length).toEqual(1);

  //make first move
  const p0Card = p0.getState()?.G.players['0'].hand[3] || '';
  expect(p0Card).not.toEqual('');
  p0.moves.SelectStory('Honolulu', p0Card);
  //check hand
  expect(p0.getState()?.G.players['0'].hand.length).toEqual(5);
  expect(p0.getState()?.G.players['0'].hand.length).not.toContain(p0Card);
  //check phrase is published
  expect(p1.getState()?.G.phrase).toEqual('Honolulu');
  expect(p2.getState()?.G.phrase).toEqual('Honolulu');
  expect(p3.getState()?.G.phrase).toEqual('Honolulu');
  //check stages
  expect(p0.getState()?.ctx.activePlayers).toEqual({ '0': 'Waiting', '1': 'AddOwnCard', '2': 'AddOwnCard', '3': 'AddOwnCard' });


  //p1 choose card
  const p1Card = p1.getState()?.G.players['1'].hand[2] || '';
  expect(p1Card).not.toEqual('');
  p1.moves.SelectCard(p1Card)
  //check stages
  expect(p1.getState()?.ctx.activePlayers).toEqual({ '0': 'Waiting', '2': 'AddOwnCard', '3': 'AddOwnCard' });
  //check hand
  expect(p1.getState()?.G.players['1'].hand.length).toEqual(5);
  expect(p1.getState()?.G.players['1'].hand.length).not.toContain(p1Card);
  //check nothing published
  expect(p1.getState()?.G.playedCards).toEqual([]);

  //p2 choose card
  const p2Card = p2.getState()?.G.players['2'].hand[5] || '';
  expect(p2Card).not.toEqual('');
  p2.moves.SelectCard(p2Card);
  //check stages
  expect(p2.getState()?.ctx.activePlayers).toEqual({ '0': 'Waiting', '3': 'AddOwnCard' });
  //check hand
  expect(p2.getState()?.G.players['2'].hand.length).toEqual(5);
  expect(p2.getState()?.G.players['2'].hand.length).not.toContain(p2Card);
  //check nothing published
  expect(p2.getState()?.G.playedCards).toEqual([]);

  //p3 choose card
  const p3Card = p3.getState()?.G.players['3'].hand[1] || '';
  expect(p3Card).not.toEqual('');
  p3.moves.SelectCard(p3Card);
  //check stages
  expect(p3.getState()?.ctx.activePlayers).toEqual({ '0': 'Waiting', '1': 'VoteStory', '2': 'VoteStory', '3': 'VoteStory' });
  //check hand
  expect(p3.getState()?.G.players['3'].hand.length).toEqual(5);
  expect(p3.getState()?.G.players['3'].hand.length).not.toContain(p3Card);
  //check all cards published
  expect(p3.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({str:p0Card})]));
  expect(p2.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({str:p1Card})]));
  expect(p1.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({str:p2Card})]));
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({str:p3Card})]));

  //Voting
  p1.moves.VoteCard(p0Card);
  p2.moves.VoteCard(p1Card);
  //check nothing published
  expect(p3.getState()?.G.playedCards[0].playedBy).toEqual(undefined);
  expect(p3.getState()?.G.playedCards[1].playedBy).toEqual(undefined);
  expect(p1.getState()?.G.playedCards[2].playedBy).toEqual(undefined);
  //check stages
  expect(p3.getState()?.ctx.activePlayers).toEqual({ '0': 'Waiting', '3': 'VoteStory' });

  p3.moves.VoteCard(p0Card);
  //check everything published
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({str:p0Card,playedBy:'0',votedBy:['1','3']})]))
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({str:p1Card,playedBy:'1',votedBy:['2']})]))
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({str:p2Card,playedBy:'2',votedBy:[]})]))
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({str:p3Card,playedBy:'3',votedBy:[]})]))

  //check stages
  expect(p3.getState()?.ctx.activePlayers).toEqual({ '0': 'Finish', '1': 'Waiting', '2': 'Waiting', '3': 'Waiting' });
  expect(p2.getState()?.ctx.activePlayers).toEqual({ '0': 'Finish', '1': 'Waiting', '2': 'Waiting', '3': 'Waiting' });
  expect(p0.getState()?.ctx.activePlayers).toEqual({ '0': 'Finish', '1': 'Waiting', '2': 'Waiting', '3': 'Waiting' });


  p0.moves.EndTurn();
  //next player is 1
  expect(p0.getState()?.ctx.currentPlayer).toEqual('1');
  //he is in story telling, other are waiting
  expect(p0.getState()?.ctx.activePlayers).toEqual({ '1': 'Storytelling', '0': 'Waiting', '2': 'Waiting', '3': 'Waiting' });
  //check hand cards
  expect(p0.getState()?.G.players['0'].hand.length).toEqual(6);
  expect(p1.getState()?.G.players['1'].hand.length).toEqual(6);
  expect(p2.getState()?.G.players['2'].hand.length).toEqual(6);
  expect(p3.getState()?.G.players['3'].hand.length).toEqual(6);

});