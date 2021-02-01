
import { Ctx, Game, PlayerID } from 'boardgame.io';
import { INVALID_MOVE, PlayerView } from 'boardgame.io/core';


export interface DixitGameState {
    secret:
    {
        drawPile: string[],
        playedCards: {
            str: string,
            playedBy: PlayerID,
            votedBy: PlayerID[]
        }[]
    },
    players:
    {
        [key: string]: { hand: string[] }
    }
    phrase?: string;
    playedCards: {
            str: string,
            playedBy?: PlayerID,
            votedBy?: PlayerID[]
        }[]
}

export function setupGame(ctx: Ctx) {
    let G:DixitGameState = {
        secret:
        {
            drawPile: ["A","B","C","D","E","F","G","H","I","J","K","L","M","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6"],
            playedCards: []
        },
        players: {},
        playedCards: []
    }
    //shuffle deck
    G.secret.drawPile = ctx.random?.Shuffle(G.secret.drawPile) || [];
    //add number of players
    for(let i = 0; i<ctx.numPlayers;i++){
        G.players[String(i)] = { hand: [] };
    }
    return G;
}


export function setupTurn(G: DixitGameState, ctx: Ctx) {
    //draw six cards each
    for (let playerID in G.players) {
        while (G.players[playerID].hand.length < 6) {
            //get card
            let card = G.secret.drawPile.pop();

            //was last, end the game
            if (!card) {
                if(ctx.events?.endGame) ctx.events.endGame();
                return;
            }

            //add to hand
            G.players[playerID].hand.push(card);
        }
    }

}

export function endPhase(G: DixitGameState, ctx: Ctx) {
    return false;
}

//all moves
export function SelectStory(G: DixitGameState, ctx: Ctx, phrase: string, image: string) {
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
    G.phrase = phrase;
    G.secret.playedCards.push({
        str: image,
        playedBy: ctx.playerID,
        votedBy: []
    });

    //remove from hand
    plystate.hand.splice(idx, 1);

    //move to next stage
    if(ctx.events?.setActivePlayers) ctx.events.setActivePlayers ({
        currentPlayer: { stage: 'Waiting', moveLimit: 1 },
        others: { stage: 'AddOwnCard', moveLimit: 1 }
    });
}

export function SelectCard(G: DixitGameState, ctx: Ctx, image: string) {
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
    G.secret.playedCards.push({
        str: image,
        playedBy: ctx.playerID,
        votedBy: []
    });

    //remove from hand
    plystate.hand.splice(idx, 1);

    //if last, move to next state
    let allInWatingButMe: boolean = true;
    for (let playerID in ctx.activePlayers) {
        if (ctx.activePlayers[playerID] != 'Waiting' && playerID != ctx.playerID) {
            allInWatingButMe = false;
        }
    }
    if (allInWatingButMe) {
        //shuffle and show cards                
        if(ctx.random?.Shuffle)
        G.secret.playedCards = ctx.random.Shuffle(G.secret.playedCards);

        for(let i=0;i<G.secret.playedCards.length;i++){
            G.playedCards.push({str:G.secret.playedCards[i].str});
        }

        //goto next stage
        if(ctx.events?.setActivePlayers) ctx.events.setActivePlayers ({
            currentPlayer: { stage: 'Waiting', moveLimit: 1 },
            others: { stage: 'VoteStory', moveLimit: 1 }
        });
    }
}

export function VoteCard(G: DixitGameState, ctx: Ctx, image: string) {
    //if no player is give, it is an invalid move
    if (!ctx.playerID) {
        return INVALID_MOVE;
    }
    //only other players may move
    if (ctx.playerID == ctx.currentPlayer) {
        return INVALID_MOVE;
    }
    //if not on voting, it is an invalid move
    const idx: number = G.secret.playedCards.map(c => c.str).indexOf(image);
    if (idx == -1) {
        return INVALID_MOVE;
    }

    //save voting
    G.secret.playedCards[idx].votedBy.push(ctx.playerID);

    //if last, move to next state
    let allInWatingButMe: boolean = true;
    for (let playerID in ctx.activePlayers) {
        if (ctx.activePlayers[playerID] != 'Waiting' && playerID != ctx.playerID) {
            allInWatingButMe = false;
        }
    }
    if (allInWatingButMe) {
        //show voting
        for(let i=0;i<G.secret.playedCards.length;i++){
            G.playedCards[i].votedBy = G.secret.playedCards[i].votedBy;
            G.playedCards[i].playedBy = G.secret.playedCards[i].playedBy;
        }
        //move to next stage
        if(ctx.events?.setActivePlayers) ctx.events.setActivePlayers ({
            currentPlayer: { stage: 'Finish', moveLimit: 1 },
            others: { stage: 'Waiting', moveLimit: 1 }
        });
    }
}

export function EndTurn(G: DixitGameState, ctx: Ctx) {
    if(ctx.events?.endTurn) ctx.events.endTurn();
}

const PhaseSetup = {
}

const PhaseMain: Game<DixitGameState, Ctx> = {
    playerView: PlayerView.STRIP_SECRETS,
    setup: setupGame,
    phases: {
        Main: {
            start: true,
            turn: {
                 //start with sotory telling
                activePlayers:    
                {
                    currentPlayer: { stage: 'Storytelling', moveLimit: 1 },
                    others: { stage: 'Waiting', moveLimit: 1 }
                },
                onBegin: setupTurn,
                stages: {
                    Waiting:
                    {
                        moves: {},
                        next: 'Waiting'
                    },
                    Storytelling:
                    {
                        moves: { SelectStory : {move:SelectStory,client:false} },
                        next: 'Waiting'
                    },
                    AddOwnCard:
                    {
                        moves: { SelectCard :{move:SelectCard,client:false} },
                        next: 'Waiting'
                    },
                    VoteStory:
                    {
                        moves: { VoteCard:{move:VoteCard,client:false} },
                        next: 'Waiting'
                    },
                    Finish:
                    {
                        moves: { EndTurn:{move:EndTurn,client:false} },
                        next: 'Waiting'
                    }
                }
            },
            // Ends the phase if this returns true.
            endIf: endPhase,
        }
    },
};

export const Dixit: Game<DixitGameState, Ctx> = { ...PhaseSetup, ...PhaseMain }; 