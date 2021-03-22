import * as React from "react";
import backside from 'img/backside.png';

import { BoardProps } from "boardgame.io/react";
import { DixitGameState } from "Game";
import classNames from "classnames";
import style from "./style.module.scss";

import { OpponentList } from "./Opponent";
import { CardPile } from "./CardPile";
import { Cards, CardsFullInfo, CardsToChoose } from "./Cards";
import { ChoseCommand, VoteCommand, WatingCommand, StoryTellingCommand } from "./Command";
import { Button } from "components/Button";



export type FullPlayerInfo = { playerID: string, nickname: string, cardCount: number, points: number }[];

interface StageProps {
    myhand: number[]
    playerInfos: FullPlayerInfo
    playerID: string
    public: DixitGameState
    storyTellerName: string
    onChooseStory?: (phrase: string, cardID: number) => void
    onChooseCard?: (cardID: number) => void
    onEndButtonClicked?: () => void
}


class StageWaiting extends React.Component<StageProps> {
    playedCards() {
        const playerIDs = Object.keys(this.props.public.players);
        if (playerIDs.length > 0 && playerIDs[0] !== "null") {
            const playedCards = this.props.public.players[playerIDs[0]].playedCards;
            if (playedCards !== undefined) {
                //info about played cards is available
                return (<CardsFullInfo playedCards={playedCards} playerInfo={this.props.playerInfos} />)
            }
        }
        //show backsides only
        return (<CardPile cards={Array(this.props.public.playedCards.length).fill(backside)} />)
    }

    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__waiting)}>
                <OpponentList opponents={others} />
                {this.playedCards()}
                <WatingCommand />
                <Cards cards={this.props.myhand} />
            </div>
        )
    }
}


class StageStorytelling extends React.Component<StageProps, { phrase: string }>
{
    constructor(props: any) {
        super(props);
        this.state = { phrase: '' };
        this.phraseChanged = this.phraseChanged.bind(this);
        this.cardSelected = this.cardSelected.bind(this);
    }

    phraseChanged(phrase: string) {
        this.setState({ phrase: phrase });
    }

    cardSelected(src: number) {
        //TODO show error if phrase is empty
        if (!this.props.onChooseStory) {
            throw "this.props.onChooseStory Must be defined";
        }
        this.props.onChooseStory(this.state.phrase, src);
    }

    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__storytelling)}>
                <OpponentList opponents={others} />
                <CardPile cards={Array(this.props.public.playedCards.length).fill(backside)} />
                <StoryTellingCommand onChange={this.phraseChanged} phrase={this.state.phrase} />
                <CardsToChoose cards={this.props.myhand} handler={this.cardSelected} />
            </div>
        )
    }
}


class StageAddOwnCard extends React.Component<StageProps>
{
    constructor(props: any) {
        super(props);
        this.cardSelected = this.cardSelected.bind(this);
    }

    cardSelected(cardID: number) {
        if (!this.props.onChooseCard) {
            throw "this.props.onChooseCard Must be defined";
        }
        this.props.onChooseCard(cardID);
    }

    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__addowncard)}>
                <OpponentList opponents={others} />
                <CardPile cards={Array(this.props.public.playedCards.length).fill(backside)} />
                <ChoseCommand phrase={this.props.public.phrase} />
                <CardsToChoose cards={this.props.myhand} handler={this.cardSelected} />
            </div>
        )
    }
}

class StageVoteStory extends React.Component<StageProps>
{
    constructor(props: any) {
        super(props);
        this.cardSelected = this.cardSelected.bind(this);
    }

    cardSelected(cardID: number) {
        if (!this.props.onChooseCard) {
            throw "this.props.onChooseCard Must be defined";
        }
        this.props.onChooseCard(cardID);
    }

    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__votestory)}>
                <OpponentList opponents={others} />
                <VoteCommand player={this.props.storyTellerName} phrase={this.props.public.phrase} />
                <CardsToChoose cards={this.props.public.playedCards.map(x => x.cardID)} handler={this.cardSelected} />
                <Cards cards={this.props.myhand} />
            </div>
        )
    }
}

class StageFinish extends React.Component<StageProps>
{
    constructor(props: any) {
        super(props);
    }

    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__finish)}>
                <OpponentList opponents={others} />
                <CardsFullInfo playedCards={this.props.public.playedCards} playerInfo={this.props.playerInfos} />
                {this.props.onEndButtonClicked && <Button onClick={this.props.onEndButtonClicked}>End Round</Button>}
                <Cards cards={this.props.myhand} />
            </div>
        )
    }
}

export class DixitBoard extends React.Component<BoardProps<DixitGameState>, any> {
    render() {
        if (!this.props.matchData) {
            return (<div>"this.props.matchData is not defined."</div>);
        }
        if (!this.props.playerID) {
            return (<div>"this.props.playerID is not defined."</div>);
        }
        if (!this.props.ctx.activePlayers) {
            return (<div>Error, this.props.ctx.activePlayers not defined</div>)
        }
        //mapping from id to name comes from this.props.matchData  
        //G stores only player ids (as string), but no names
        let playerNames: { playerID: string, nickname: string }[] = [];
        playerNames = this.props.matchData.reduce((map, obj) => {
            map.push({ playerID: String(obj.id), nickname: obj.name || "NoName" })
            return map
        }, playerNames);

        //componentes take merged players object, with both names, and id
        let fullPlayerInfo: FullPlayerInfo = [];
        fullPlayerInfo = playerNames.map((lobbyPlayer) => {
            let gamePlayer = this.props.G.playerInfo[lobbyPlayer.playerID];
            return { playerID: lobbyPlayer.playerID, nickname: lobbyPlayer.nickname, cardCount: gamePlayer.cardCount, points: 0 }
        });

        const playerID = this.props.playerID;

        const ownCards = this.props.G.players[playerID]?.hand || [];
        const storyteller = playerNames.find((x) => x.playerID == this.props.ctx.currentPlayer)?.nickname;
        if (!storyteller) {
            return (<div>Error, this.props.ctx.currentPlayer has no name defined</div>)
        }
        switch (this.props.ctx.activePlayers[playerID]) {
            case undefined:
                return (
                    <StageWaiting
                        myhand={ownCards}
                        playerInfos={fullPlayerInfo}
                        playerID={playerID}
                        storyTellerName={storyteller}
                        public={this.props.G}
                    />
                );
            case 'Storytelling':
                return (
                    <StageStorytelling
                        myhand={ownCards}
                        playerInfos={fullPlayerInfo}
                        playerID={playerID}
                        storyTellerName={storyteller}
                        public={this.props.G}
                        onChooseStory={this.props.moves.SelectStory}
                    />
                );
            case 'AddOwnCard':
                return (
                    <StageAddOwnCard
                        myhand={ownCards}
                        playerInfos={fullPlayerInfo}
                        playerID={playerID}
                        storyTellerName={storyteller}
                        public={this.props.G}
                        onChooseCard={this.props.moves.SelectCard}
                    />
                );
            case 'VoteStory':
                return (
                    <StageVoteStory
                        myhand={ownCards}
                        playerInfos={fullPlayerInfo}
                        playerID={playerID}
                        storyTellerName={storyteller}
                        public={this.props.G}
                        onChooseCard={this.props.moves.VoteCard}
                    />
                );
            case 'Finish':
                let endTurnCallback;
                if(playerID === this.props.ctx.currentPlayer){
                    endTurnCallback = () => {
                        if(this.props.moves.EndTurn)
                            this.props.moves.EndTurn()
                    }
                }
                return (
                    <StageFinish
                        myhand={ownCards}
                        playerInfos={fullPlayerInfo}
                        playerID={playerID}
                        storyTellerName={storyteller}
                        public={this.props.G}
                        onEndButtonClicked={endTurnCallback}
                    />
                );
        }
    }
}
//export class DixitBoard extends React.Component<BoardProps<TicTacToeGameState>, never> {}