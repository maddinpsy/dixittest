jest.mock('./images')

import { Ctx } from 'boardgame.io';
import { Dixit, Scoring, setupGame } from './Game';
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
  expect(p0.getState()?.ctx.activePlayers).toEqual({ '0': 'Storytelling'});

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
  expect(p0.getState()?.ctx.activePlayers).toEqual({'1': 'AddOwnCard', '2': 'AddOwnCard', '3': 'AddOwnCard' });


  //p1 choose card
  const p1Card = p1.getState()?.G.players['1'].hand[2] || '';
  expect(p1Card).not.toEqual('');
  p1.moves.SelectCard(p1Card)
  //check stages
  expect(p1.getState()?.ctx.activePlayers).toEqual({'2': 'AddOwnCard', '3': 'AddOwnCard' });
  //check hand
  expect(p1.getState()?.G.players['1'].hand.length).toEqual(5);
  expect(p1.getState()?.G.players['1'].hand.length).not.toContain(p1Card);
  //check nothing published
  expect(p1.getState()?.G.playedCards).toEqual([{playedBy:"0",votedBy:[]},{playedBy:"1",votedBy:[]}]);

  //p2 choose card
  const p2Card = p2.getState()?.G.players['2'].hand[5] || '';
  expect(p2Card).not.toEqual('');
  p2.moves.SelectCard(p2Card);
  //check stages
  expect(p2.getState()?.ctx.activePlayers).toEqual({'3': 'AddOwnCard' });
  //check hand
  expect(p2.getState()?.G.players['2'].hand.length).toEqual(5);
  expect(p2.getState()?.G.players['2'].hand.length).not.toContain(p2Card);
  //check nothing published
  expect(p2.getState()?.G.playedCards).toEqual([{playedBy:"0",votedBy:[]},{playedBy:"1",votedBy:[]},{playedBy:"2",votedBy:[]}]);

  //p3 choose card
  const p3Card = p3.getState()?.G.players['3'].hand[1] || '';
  expect(p3Card).not.toEqual('');
  p3.moves.SelectCard(p3Card);
  //check stages
  expect(p3.getState()?.ctx.activePlayers).toEqual({ '1': 'VoteStory', '2': 'VoteStory', '3': 'VoteStory' });
  //check hand
  expect(p3.getState()?.G.players['3'].hand.length).toEqual(5);
  expect(p3.getState()?.G.players['3'].hand.length).not.toContain(p3Card);
  //check all cards published
  expect(p3.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({ cardID: p0Card })]));
  expect(p2.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({ cardID: p1Card })]));
  expect(p1.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({ cardID: p2Card })]));
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({ cardID: p3Card })]));

  //Voting
  p1.moves.VoteCard(p0Card);
  p2.moves.VoteCard(p1Card);
  //check nothing published
  expect(p3.getState()?.G.playedCards[0].playedBy).toEqual(undefined);
  expect(p3.getState()?.G.playedCards[1].playedBy).toEqual(undefined);
  expect(p1.getState()?.G.playedCards[2].playedBy).toEqual(undefined);
  //check stages
  expect(p3.getState()?.ctx.activePlayers).toEqual({'3': 'VoteStory' });

  p3.moves.VoteCard(p0Card);
  //check everything published
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({ cardID: p0Card, playedBy: '0', votedBy: ['1', '3'] })]))
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({ cardID: p1Card, playedBy: '1', votedBy: ['2'] })]))
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({ cardID: p2Card, playedBy: '2', votedBy: [] })]))
  expect(p0.getState()?.G.playedCards).toEqual(expect.arrayContaining([expect.objectContaining({ cardID: p3Card, playedBy: '3', votedBy: [] })]))

  //check stages
  expect(p3.getState()?.ctx.activePlayers).toEqual({ '0': 'Finish', '1': 'Finish', '2': 'Finish', '3': 'Finish' });
  expect(p2.getState()?.ctx.activePlayers).toEqual({ '0': 'Finish', '1': 'Finish', '2': 'Finish', '3': 'Finish' });
  expect(p0.getState()?.ctx.activePlayers).toEqual({ '0': 'Finish', '1': 'Finish', '2': 'Finish', '3': 'Finish' });


  p0.moves.EndTurn();
  //next player is 1
  expect(p0.getState()?.ctx.currentPlayer).toEqual('1');
  //he is in story telling, other are waiting
  expect(p0.getState()?.ctx.activePlayers).toEqual({ '1': 'Storytelling'});
  //check hand cards
  expect(p0.getState()?.G.players['0'].hand.length).toEqual(6);
  expect(p1.getState()?.G.players['1'].hand.length).toEqual(6);
  expect(p2.getState()?.G.players['2'].hand.length).toEqual(6);
  expect(p3.getState()?.G.players['3'].hand.length).toEqual(6);

});


it('scorres correctly when all choose storytellers card', () => {
  let ctx: Ctx = {
    numPlayers: 5,
    playOrder: ["1", "2", "3", "4", "5"],
    playOrderPos: 4,
    activePlayers: null,
    currentPlayer: "5",
    turn: 7,
    phase: "Main",
  }
  let G = setupGame(ctx);

  //setup
G.playedCards=[
  {playedBy:"1",cardID:10,votedBy:[]},
  {playedBy:"2",cardID:20,votedBy:[]},
  {playedBy:"3",cardID:30,votedBy:[]},
  {playedBy:"4",cardID:40,votedBy:[]},
  {playedBy:"5",cardID:50,votedBy:["1","2","3","4"]}
]

  //run
  Scoring(G, ctx);

  //validate
  expect(G.playerInfo["1"].score).toBe(2);
  expect(G.playerInfo["2"].score).toBe(2);
  expect(G.playerInfo["3"].score).toBe(2);
  expect(G.playerInfo["4"].score).toBe(2);
  expect(G.playerInfo["5"].score).toBe(0);
});

it('scorres correctly when none choose storytellers card', () => {
  let ctx: Ctx = {
    numPlayers: 5,
    playOrder: ["1", "2", "3", "4", "5"],
    playOrderPos: 4,
    activePlayers: null,
    currentPlayer: "5",
    turn: 7,
    phase: "Main",
  }
  let G = setupGame(ctx);

  //setup
G.playedCards=[
  {playedBy:"1",cardID:10,votedBy:[]},
  {playedBy:"2",cardID:20,votedBy:["3"]},
  {playedBy:"3",cardID:30,votedBy:["4"]},
  {playedBy:"4",cardID:40,votedBy:["1","2"]},
  {playedBy:"5",cardID:50,votedBy:[]}
]

  //run
  Scoring(G, ctx);

  //validate
  expect(G.playerInfo["1"].score).toBe(2);
  expect(G.playerInfo["2"].score).toBe(3);
  expect(G.playerInfo["3"].score).toBe(3);
  expect(G.playerInfo["4"].score).toBe(4);
  expect(G.playerInfo["5"].score).toBe(0);
});

it('scorres correctly when some choose storytellers card', () => {
  let ctx: Ctx = {
    numPlayers: 5,
    playOrder: ["lump", "en", "pack", "4", "5"],
    playOrderPos: 4,
    activePlayers: null,
    currentPlayer: "5",
    turn: 7,
    phase: "Main",
  }
  let G = setupGame(ctx);

  //setup
G.playedCards=[
  {playedBy:"lump",cardID:10,votedBy:[]},
  {playedBy:"en",cardID:20,votedBy:["lump","pack"]},
  {playedBy:"pack",cardID:30,votedBy:[]},
  {playedBy:"4",cardID:40,votedBy:[]},
  {playedBy:"5",cardID:50,votedBy:["en","4"]}
]

  //run
  Scoring(G, ctx);

  //validate
  expect(G.playerInfo["lump"].score).toBe(0);
  expect(G.playerInfo["en"].score).toBe(5);
  expect(G.playerInfo["pack"].score).toBe(0);
  expect(G.playerInfo["4"].score).toBe(3);
  expect(G.playerInfo["5"].score).toBe(3);
});