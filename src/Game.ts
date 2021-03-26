
import { Ctx, Game, PlayerID } from 'boardgame.io';
import { INVALID_MOVE, PlayerView } from 'boardgame.io/core';

export interface PlayedCard {
    cardID?: number,
    playedBy?: PlayerID,
    votedBy: PlayerID[]
}

export interface DixitGameState {
    secret:
    {
        drawPile: number[],
        playedCards: PlayedCard[]
    },
    players:
    {
        [key: string]: {
            hand: number[]
            playedCards?: PlayedCard[]
        }
    }
    playerInfo:
    {
        [key: string]: { cardCount: number, score: number }
    }
    phrase: string;
    playedCards: PlayedCard[]
}

export function setupGame(ctx: Ctx) {
    let G: DixitGameState = {
        secret:
        {
            drawPile: Array.from(Array(59).keys()),
            playedCards: []
        },
        phrase: '',
        players: {},
        playedCards: [],
        playerInfo: {},
    }
    //shuffle deck
    G.secret.drawPile = ctx.random?.Shuffle(G.secret.drawPile) || [];
    //add number of players
    for (let i = 0; i < ctx.numPlayers; i++) {
        G.players[String(i)] = { hand: [] };
        G.playerInfo[String(i)] = { cardCount: 0, score: 0 };
    }
    return G;
}

function updatePublicKnowledge(G: DixitGameState, ctx: Ctx) {
    //player card count
    for (let playerID in G.players) {
        G.playerInfo[playerID].cardCount = G.players[playerID].hand.length;
    }

    //everything to curret player
    G.players[ctx.currentPlayer].playedCards = G.secret.playedCards;
}

export function setupTurn(G: DixitGameState, ctx: Ctx) {
    //clenup last turn
    G.phrase = '';
    G.playedCards = [];
    G.secret.playedCards = [];
    for (let pId in G.players) {
        G.players[pId].playedCards = undefined;
    }
    //draw six cards each
    for (let playerID in G.players) {
        while (G.players[playerID].hand.length < 6) {
            //get card
            let card = G.secret.drawPile.pop();

            //was last, end the game
            if (!card) {
                if (ctx.events?.endGame) ctx.events.endGame();
                return;
            }

            //add to hand
            G.players[playerID].hand.push(card);
        }
    }
    updatePublicKnowledge(G, ctx);
}

export function endPhase(G: DixitGameState, ctx: Ctx) {
    return false;
}

//all moves
export function SelectStory(G: DixitGameState, ctx: Ctx, phrase: string, image: number) {
    //if no player is give, it is an invalid move
    if (ctx.playerID === undefined) {
        return INVALID_MOVE;
    }
    //only current player may move
    if (ctx.playerID !== ctx.currentPlayer) {
        return INVALID_MOVE;
    }
    const plystate = G.players[ctx.playerID];
    //if not on hand, it is an invalid move
    const idx: number = plystate.hand.indexOf(image);
    if (idx === -1) {
        return INVALID_MOVE;
    }

    //save as choosen card and phrase
    G.phrase = phrase;
    G.secret.playedCards.push({
        cardID: image,
        playedBy: ctx.playerID,
        votedBy: []
    });
    G.playedCards.push({
        playedBy: ctx.playerID,
        votedBy: []
    });

    //remove from hand
    plystate.hand.splice(idx, 1);

    //move to next stage
    if (ctx.events?.setActivePlayers) ctx.events.setActivePlayers({
        others: { stage: 'AddOwnCard', moveLimit: 1 }
    });
}

export function SelectCard(G: DixitGameState, ctx: Ctx, image: number) {
    //if no player is give, it is an invalid move
    if (!ctx.playerID) {
        return INVALID_MOVE;
    }
    //only other players may move
    if (ctx.playerID === ctx.currentPlayer) {
        return INVALID_MOVE;
    }
    const plystate = G.players[ctx.playerID];
    //if not on hand, it is an invalid move
    const idx: number = plystate.hand.indexOf(image);
    if (idx === -1) {
        return INVALID_MOVE;
    }

    //save card
    G.secret.playedCards.push({
        cardID: image,
        playedBy: ctx.playerID,
        votedBy: []
    });
    G.playedCards.push({
        playedBy: ctx.playerID,
        votedBy: []
    });

    //remove from hand
    plystate.hand.splice(idx, 1);

    //if last, move to next state
    let allInWatingButMe: boolean = true;
    for (let playerID in ctx.activePlayers) {
        if (playerID !== ctx.playerID) {
            allInWatingButMe = false;
        }
    }
    if (allInWatingButMe) {
        //shuffle and show cards                
        if (ctx.random?.Shuffle)
            G.secret.playedCards = ctx.random.Shuffle(G.secret.playedCards);
        G.playedCards = [];
        for (let i = 0; i < G.secret.playedCards.length; i++) {
            G.playedCards.push({ cardID: G.secret.playedCards[i].cardID, votedBy: [] });
        }

        //goto next stage
        if (ctx.events?.setActivePlayers) ctx.events.setActivePlayers({
            others: { stage: 'VoteStory', moveLimit: 1 }
        });
    }
}

export function Scoring(G: DixitGameState, ctx: Ctx) {
    let storyTellersCard = G.playedCards.find(p => p.playedBy === ctx.currentPlayer);
    if (!storyTellersCard) {
        throw new Error("This is unpossible, the storytellers card is not published.")
    }
    //storyteller got no or all votes 
    if (storyTellersCard.votedBy.length === 0 || storyTellersCard.votedBy.length === ctx.numPlayers - 1) {
        Object.keys(G.playerInfo).forEach(p => {
            //everbody gets 2 points, except story teller
            if (p !== ctx.currentPlayer) {
                G.playerInfo[p].score += 2;
            }
        });
    } else {
        //storyteller got at least one vote and not all
        G.playerInfo[ctx.currentPlayer].score += 3;
        //every one voting correct image gets 3 points
        storyTellersCard.votedBy.forEach(p => {
            G.playerInfo[p].score += 3;
        })
        //everyone, except story teller, receiving votes, gets one point per vote
        G.playedCards
            .filter(p => p.playedBy !== ctx.currentPlayer)
            .forEach(p => {
                if (!p.playedBy) {
                    throw new Error("This is unpossible, scoring cannot be done without playedBy info.")
                }
                G.playerInfo[p.playedBy].score += p.votedBy.length
            });
    }
}

export function GotoFinalState(G: DixitGameState, ctx: Ctx) {
    //show voting
    for (let i = 0; i < G.secret.playedCards.length; i++) {
        G.playedCards[i].votedBy = G.secret.playedCards[i].votedBy;
        G.playedCards[i].playedBy = G.secret.playedCards[i].playedBy;
    }
    Scoring(G, ctx);
    //move to next stage
    if (ctx.events?.setActivePlayers) ctx.events.setActivePlayers({
        currentPlayer: { stage: 'Finish', moveLimit: 1 },
        others: { stage: 'Finish', moveLimit: 0 },
    });
}

export function VoteCard(G: DixitGameState, ctx: Ctx, image: number) {
    //if no player is give, it is an invalid move
    if (!ctx.playerID) {
        return INVALID_MOVE;
    }
    //only other players may move
    if (ctx.playerID === ctx.currentPlayer) {
        return INVALID_MOVE;
    }
    //if not on voting, it is an invalid move
    const idx: number = G.secret.playedCards.map(c => c.cardID).indexOf(image);
    if (idx === -1) {
        return INVALID_MOVE;
    }

    //save voting
    G.secret.playedCards[idx].votedBy.push(ctx.playerID);


    //publish knowledge to this palyer
    G.players[ctx.playerID].playedCards = G.secret.playedCards;
    //publish knowledge to all palyers waiting
    ctx.playOrder.filter(pID => !ctx.activePlayers || !(pID in ctx.activePlayers))
        .forEach((pID) => {
            G.players[pID].playedCards = G.secret.playedCards;
        });

    //if last, move to next state
    let allInWatingButMe: boolean = true;
    for (let playerID in ctx.activePlayers) {
        if (playerID !== ctx.playerID) {
            allInWatingButMe = false;
        }
    }
    if (allInWatingButMe) {
        GotoFinalState(G, ctx);
    }
}

export function EndTurn(G: DixitGameState, ctx: Ctx) {
    if (ctx.playerID !== ctx.currentPlayer)
        return INVALID_MOVE;
    if (ctx.events?.endTurn)
        ctx.events.endTurn();
}


export const Dixit: Game<DixitGameState, Ctx> = {
    name: "Dixit",
    minPlayers: 3,
    maxPlayers: 6,
    playerView: PlayerView.STRIP_SECRETS,
    setup: setupGame,
    phases: {
        Main: {
            start: true,
            turn: {
                //start with story telling
                activePlayers:
                {
                    currentPlayer: { stage: 'Storytelling', moveLimit: 1 },
                },
                onBegin: setupTurn,
                onMove: updatePublicKnowledge,
                stages: {
                    Storytelling:
                    {
                        moves: { SelectStory: { move: SelectStory, client: false } },
                    },
                    AddOwnCard:
                    {
                        moves: { SelectCard: { move: SelectCard, client: false } },
                    },
                    VoteStory:
                    {
                        moves: { VoteCard: { move: VoteCard, client: false } },
                    },
                    Finish:
                    {
                        moves: { EndTurn: { move: EndTurn, client: false } },
                    }
                }
            },
            // Ends the phase if this returns true.
            endIf: endPhase,
        }
    },
};

