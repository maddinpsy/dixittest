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
import { ScoreBoard } from "components/Board/ScoreBoard";
import { Loading } from "components/Loading";



export type FullPlayerInfo = { playerID: string, nickname: string, cardCount: number, score: number }[];

interface StageProps {
    myhand: number[]
    playerInfos: FullPlayerInfo
    playerID: string
    public: DixitGameState
    storyTellerName: string
    remainingCards: number
    onChooseStory?: (phrase: string, cardID: number) => void
    onChooseCard?: (cardID: number) => void
    onEndButtonClicked?: () => void
}


class StageWaiting extends React.Component<StageProps> {
    dropLocation: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);
        this.dropLocation = React.createRef();
    }

    playedCards() {
        const playedCards = this.props.public.players[this.props.playerID]?.playedCards;
        if (playedCards !== undefined) {
            //info about played cards is available
            return (<CardsFullInfo playedCards={playedCards} playerInfo={this.props.playerInfos} forwardedRef={this.dropLocation} />)
        }
        //show backsides only
        return (<CardPile cards={Array(this.props.public.playedCards.length).fill(backside)} forwardedRef={this.dropLocation} />)
    }

    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__waiting)}>
                <OpponentList opponents={others} animationDestination={this.dropLocation} />
                <ScoreBoard playerID={this.props.playerID} playerInfos={this.props.playerInfos} remainingCards={this.props.remainingCards} />
                <div className={style.Board__mainArea}>
                    {this.playedCards()}
                </div>
                <div className={style.Board__commandArea}>
                    <WatingCommand />
                </div>
                <div className={style.Board__ownCards}>
                    <Cards cards={this.props.myhand} />
                </div>
            </div>
        )
    }
}


class StageStorytelling extends React.Component<StageProps, { phrase: string }>
{
    dropLocationRef: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);
        this.state = { phrase: '' };
        this.dropLocationRef = React.createRef();
        this.phraseChanged = this.phraseChanged.bind(this);
        this.cardSelected = this.cardSelected.bind(this);
    }

    phraseChanged(phrase: string) {
        this.setState({ phrase: phrase });
    }

    cardSelected(src: number) {
        //TODO show error if phrase is empty
        if (!this.props.onChooseStory) {
            throw new Error("this.props.onChooseStory Must be defined");
        }
        this.props.onChooseStory(this.state.phrase, src);
    }


    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__storytelling)}>
                <OpponentList opponents={others} />
                <ScoreBoard playerID={this.props.playerID} playerInfos={this.props.playerInfos} remainingCards={this.props.remainingCards} />
                <div className={style.Board__mainArea}>
                    <CardPile cards={Array(this.props.public.playedCards.length).fill(backside)} forwardedRef={this.dropLocationRef} />
                </div>
                <div className={style.Board__commandArea}>
                    <StoryTellingCommand onChange={this.phraseChanged} phrase={this.state.phrase} />
                </div>
                <div className={style.Board__ownCards}>
                    <CardsToChoose cards={this.props.myhand} handler={this.cardSelected} animationDestination={this.dropLocationRef} />
                </div>
            </div>
        )
    }
}


class StageAddOwnCard extends React.Component<StageProps>
{
    dropLocationRef: React.RefObject<HTMLDivElement>;

    constructor(props: any) {
        super(props);
        this.dropLocationRef = React.createRef();
        this.cardSelected = this.cardSelected.bind(this);
    }

    cardSelected(cardID: number) {
        if (!this.props.onChooseCard) {
            throw new Error("this.props.onChooseCard Must be defined");
        }
        this.props.onChooseCard(cardID);
    }


    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__addowncard)}>
                <OpponentList opponents={others} animationDestination={this.dropLocationRef} />
                <ScoreBoard playerID={this.props.playerID} playerInfos={this.props.playerInfos} remainingCards={this.props.remainingCards} />
                <div className={style.Board__mainArea}>
                    <CardPile cards={Array(this.props.public.playedCards.length).fill(backside)} forwardedRef={this.dropLocationRef} />
                </div>
                <div className={style.Board__commandArea}>
                    <ChoseCommand phrase={this.props.public.phrase} />
                </div>
                <div className={style.Board__ownCards}>
                    <CardsToChoose cards={this.props.myhand} handler={this.cardSelected} animationDestination={this.dropLocationRef} />
                </div>
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
            throw new Error("this.props.onChooseCard Must be defined");
        }
        this.props.onChooseCard(cardID);
    }

    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__votestory)}>
                <OpponentList opponents={others} />
                <ScoreBoard playerID={this.props.playerID} playerInfos={this.props.playerInfos} remainingCards={this.props.remainingCards} />
                <div className={style.Board__mainArea}>
                    <CardsToChoose cards={this.props.public.playedCards.map(x => x.cardID || 0)} handler={this.cardSelected} />
                </div>
                <div className={style.Board__commandArea}>
                    <VoteCommand player={this.props.storyTellerName} phrase={this.props.public.phrase} />
                </div>
                <div className={style.Board__ownCards}>
                    <Cards cards={this.props.myhand} />
                </div>

            </div>
        )
    }
}

class StageFinish extends React.Component<StageProps>
{
    render() {
        const others = this.props.playerInfos.filter(x => x.playerID !== this.props.playerID);
        return (
            <div className={classNames(style.Board__board, style.Board__finish)}>
                <OpponentList opponents={others} />

                <ScoreBoard playerID={this.props.playerID} playerInfos={this.props.playerInfos} remainingCards={this.props.remainingCards} />
                <div className={style.Board__mainArea}>
                    <CardsFullInfo playedCards={this.props.public.playedCards} playerInfo={this.props.playerInfos} />
                </div>
                <div className={style.Board__commandArea}>
                    {this.props.onEndButtonClicked && <Button onClick={this.props.onEndButtonClicked}>End Round</Button>}
                </div>
                <div className={style.Board__ownCards}>
                    <Cards cards={this.props.myhand} />
                </div>
            </div>
        )
    }
}

export class DixitBoard extends React.Component<BoardProps<DixitGameState>, { loading: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { loading: true }
    }
    componentDidMount() {
        //avoid startup flicker, for one second
        window.setTimeout(() => this.setState({ loading: false }), 1000);
    }
    render() {
        if (this.state.loading) {
            //show loading compontne to avoid startup flicker
            return (<Loading />)
        }
        if (!this.props.matchData) {
            console.log("this.props.matchData is not defined.");
            return (<Loading />)
        }
        if (!this.props.playerID) {
            console.log("this.props.playerID is not defined.");
            return (<Loading />)
        }
        if (!this.props.ctx.activePlayers) {
            console.log("Error, this.props.ctx.activePlayers not defined.");
            return (<Loading />)
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
            return { playerID: lobbyPlayer.playerID, nickname: lobbyPlayer.nickname, cardCount: gamePlayer.cardCount, score: gamePlayer.score }
        });

        const playerID = this.props.playerID;

        const ownCards = this.props.G.players[playerID]?.hand || [];
        const storyteller = playerNames.find((x) => x.playerID === this.props.ctx.currentPlayer)?.nickname;
        if (!storyteller) {
            return (<div>Error, this.props.ctx.currentPlayer has no name defined</div>)
        }
        //show end game
        if (this.props.ctx.gameover === true) {
            return (
                <div className={style.Board__gameEndContainer}>
                    End of Game
                    <ScoreBoard playerID={this.props.playerID} playerInfos={fullPlayerInfo} remainingCards={this.props.G.ramainingCards} />
                </div>
            );
        }
        //show main phases
        switch (this.props.ctx.activePlayers[playerID]) {
            case undefined:
                return (
                    <StageWaiting
                        myhand={ownCards}
                        playerInfos={fullPlayerInfo}
                        playerID={playerID}
                        storyTellerName={storyteller}
                        public={this.props.G}
                        remainingCards={this.props.G.ramainingCards}
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
                        remainingCards={this.props.G.ramainingCards}
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
                        remainingCards={this.props.G.ramainingCards}
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
                        remainingCards={this.props.G.ramainingCards}
                    />
                );
            case 'Finish':
                let endTurnCallback;
                if (playerID === this.props.ctx.currentPlayer) {
                    endTurnCallback = () => {
                        if (this.props.moves.EndTurn)
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
                        remainingCards={this.props.G.ramainingCards}
                    />
                );
        }
    }
}
//export class DixitBoard extends React.Component<BoardProps<TicTacToeGameState>, never> {}
