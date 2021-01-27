
import { Ctx, PlayerID } from 'boardgame.io';
import { INVALID_MOVE, PlayerView } from 'boardgame.io/core';
import { nextTick } from 'process';

export interface DixitGameState {
    secret:
    {
        drawPile: string[],
        storyCard: string
        allCards: {
            str: string,
            playedBy: PlayerID,
            votedBy: PlayerID[]
        }[]
    },
    players:
    {
        [key: string]: { hand: string[] }
    }
    phrase: string;
}

function setupGame(G: DixitGameState, ctx: Ctx) {
    ctx.events?.setPhase??('Main');
}


function setupTurn(G: DixitGameState, ctx: Ctx) {
    //start with sotory telling
    ctx.events?.setActivePlayers ?? ({
        currentPlayer: { stage: 'SelectStory', moveLimit: 1 },
        others: { stage: 'Waiting', moveLimit: 1 }
    });

    //draw six cards each
    for(let playerID in G.players)
    {
        while(G.players[playerID].hand.length < 6)
        {
            //get card
            let card = G.secret.drawPile.pop();
            
            //was last, end the game
            if(!card){
                ctx.events?.endGame??({});
                return;
            }

            //add to hand
            G.players[playerID].hand.push(card);
        }
    }
    
}

function endPhase(G: DixitGameState, ctx: Ctx) {
    return false;
}

//all moves
function SelectStory(G: DixitGameState, ctx: Ctx, phrase: string, image: string) {
    //if no player is give, it is an invalid move
    if (ctx.playerID == undefined) {
        return INVALID_MOVE;
    }
    //only current player may move
    if (ctx.playerID != ctx.currentPlayer) {
        return INVALID_MOVE;
    }
    const plystate = G.players[ctx.playerID];
    //if not on hand, it is an invalid move
    const idx: number = plystate.hand.indexOf(image);
    if (idx == -1) {
        return INVALID_MOVE;
    }

    //save as choosen card and phrase
    G.secret.storyCard = image;
    G.phrase = phrase;
    G.secret.allCards.push({
        str: image,
        playedBy: ctx.playerID,
        votedBy: []
    });

    //remove from hand
    plystate.hand.splice(idx, 1);

    //move to next stage
    ctx.events?.setActivePlayers ?? ({
        currentPlayer: { stage: 'Waiting', moveLimit: 1 },
        others: { stage: 'AddOwnCard', moveLimit: 1 }
    });
}

function SelectCard(G: DixitGameState, ctx: Ctx, image: string) {
    //if no player is give, it is an invalid move
    if (!ctx.playerID) {
        return INVALID_MOVE;
    }
    //only other players may move
    if (ctx.playerID == ctx.currentPlayer) {
        return INVALID_MOVE;
    }
    const plystate = G.players[ctx.playerID];
    //if not on hand, it is an invalid move
    const idx: number = plystate.hand.indexOf(image);
    if (idx == -1) {
        return INVALID_MOVE;
    }

    //save card
    G.secret.allCards.push({
        str: image,
        playedBy: ctx.playerID,
        votedBy: []
    });

    //remove from hand
    plystate.hand.splice(idx, 1);

    //if last, move to next state
    let allInWatingButMe: boolean = true;
    for (let playerID in ctx.activePlayers) {
        if (ctx.activePlayers[playerID] != 'Waiting' || playerID != ctx.playerID) {
            allInWatingButMe = false;
        }
    }
    if (allInWatingButMe) {
        ctx.events?.setActivePlayers ?? ({
            currentPlayer: { stage: 'Waiting', moveLimit: 1 },
            others: { stage: 'VotingStory', moveLimit: 1 }
        });
    }
}

function VoteCard(G: DixitGameState, ctx: Ctx, image: string) {
    //if no player is give, it is an invalid move
    if (!ctx.playerID) {
        return INVALID_MOVE;
    }
    //only other players may move
    if (ctx.playerID == ctx.currentPlayer) {
        return INVALID_MOVE;
    }
    //if not on voting, it is an invalid move
    const idx: number = G.secret.allCards.map(c=>c.str).indexOf(image);
    if (idx == -1) {
        return INVALID_MOVE;
    }

    //save voting
    G.secret.allCards[idx].votedBy.push(ctx.playerID);

    //if last, move to next state
    let allInWatingButMe: boolean = true;
    for (let playerID in ctx.activePlayers) {
        if (ctx.activePlayers[playerID] != 'Waiting' || playerID != ctx.playerID) {
            allInWatingButMe = false;
        }
    }
    if (allInWatingButMe) {
        ctx.events?.setActivePlayers ?? ({
            currentPlayer: { stage: 'Finish', moveLimit: 1 },
            others: { stage: 'Waiting', moveLimit: 1 }
        });
    }
}

function EndTurn(G: DixitGameState, ctx: Ctx) {
    ctx.events?.endTurn??({});
}

const PhaseSetup = {
}

const PhaseMain = {
    setup: setupGame,
    phases: {
        Main: {
            turn: {
                moveLimit: 1,
                onBegin: setupTurn,
                stages: {
                    Waiting:
                    {
                        moves: {}
                    },
                    Storytelling:
                    {
                        moves: { SelectStory },
                        next: 'Waiting'
                    },
                    AddOwnCard:
                    {
                        moves: { SelectCard },
                        next: 'Waiting'
                    },
                    VotingStory:
                    {
                        moves: { VoteCard },
                        next: 'Waiting'
                    },
                    Finish:
                    {
                        moves: { EndTurn },
                        next: 'Waiting'
                    }
                }
            },
            // Ends the phase if this returns true.
            endIf: endPhase,
        }
    },
};

export const Dixit = { ...PhaseSetup, ...PhaseMain }; 