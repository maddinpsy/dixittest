import * as React from "react";
import backside from './backside.png';

import { BoardProps } from "boardgame.io/react";
import { DixitGameState, PlayedCard } from "./Game";

function Opponent(props: { name: string, cards: number }) {
    return (
        <div className="opponent">
            <CardPile cards={Array<string>(props.cards).fill(backside)} />
            <h1>{props.name}</h1>
        </div>
    )
}

function OpponentList(props: { opponents: { name: string, cardCount: number }[] }) {
    const listOp = props.opponents.map((op, idx) => (
        <Opponent name={op.name} cards={op.cardCount} key={idx} />
    ));
    return (
        <div className="opponentList">
            {listOp}
        </div>
    )
}

function Cards(props: { cards: string[] }) {
    const list = props.cards.map((value, idx) => (
        <div key={idx} className="container">
            <img src={value} alt={value} />
        </div>
    ))
    return (
        <div className="cards">
            {list}
        </div>
    )
}

function CardPile(props: { cards: string[] }) {
    const list = props.cards.map((value, idx) => (
        <img src={value} alt={value} key={idx} style={
            {
                transform: 'rotate(' + ((idx - props.cards.length / 2) * -5) + 'deg)',

            }
        } />
    ))
    return (
        <div className="cardpile">
            {list}
        </div>
    )
}

class StoryTellingCommand extends React.Component<{ phrase: string, onChange: (phrase: string) => void }> {
    onChange = (e: React.FormEvent<HTMLInputElement>): void => {
        this.props.onChange(e.currentTarget.value);
    };
    render() {
        return (
            <div className="command">
                <div>Choose a pharse:</div>
                <input type="text" value={this.props.phrase} onChange={this.onChange} />
                <div>And select a card:</div>
            </div>
        );
    }
}


function Dialog(props: { message: string }) {
    // onClick={/*close dilog*/}
    return (
        <div className="dialog">
            {props.message}
            <input type="button" value="OK" />
        </div>
    )
}

function Error() {
    return (
        <Dialog message="Plaease enter a phrase first." />
    )
}

function ChoseCommand(props: { phrase: string }) {
    return (
        <div className="command">
            <div>Select a card matching the pharse <i>{props.phrase}</i></div>
        </div>
    )
}

function VoteCommand(props: { player: string, phrase: string }) {
    return (
        <div className="command">
            <div>{props.player} chose the pharse: {props.phrase}</div>
            <div>Select the card he played:</div>
        </div>
    )
}

function WatingCommand() {
    return (
        <div className="command">
            <div>Waiting for other players</div>
        </div>
    )
}

function CardsToChoose(props: { cards: string[], handler: (src: string) => void }) {
    const list = props.cards.map((value, idx) => (
        <div key={idx} className="container">
            <img src={value} alt={value} />
            <br />
            <button onClick={() => props.handler(value)}>Choose this</button>
        </div>
    ))
    return (
        <div className="cards">
            {list}
        </div>
    )
}


class CardsFullInfo extends React.Component<{playedCards:PlayedCard[], playerInfo:{[key: string]: { name: string, cardCount: number }}}> {
    mapToName(playerID?:string):string{
        if(playerID===undefined || this.props.playerInfo[playerID] == undefined){
            return "...";
        }
        return this.props.playerInfo[playerID].name;
    }
    voters(votedBy:string[]){
        if(votedBy.length===0){
            return ;
        }
        const list = votedBy.map((value, idx) => (
            <span key={idx}>
                {idx > 0 && ","}
                {this.mapToName(value)}
            </span>
        ));
        return (<div>Voted by: {list}</div>);
    } 
    render() {
        const list = this.props.playedCards.map((value, idx) => (
            <div key={idx} className="container">
                <div>Played by: {this.mapToName(value.playedBy)}</div>
                <img src={value.str} alt={value.str} />
                {this.voters(value.votedBy)}
            </div>
        ))
        return (
            <div className="cards">
            {list}
        </div>
        )
    }
}

class StageWaiting extends React.Component<StageProps> {
    playedCards(){
        const playerIDs = Object.keys(this.props.public.players);
        if(playerIDs.length>0){
            const playedCards = this.props.public.players[playerIDs[0]].playedCards;
            if(playedCards!==undefined){
                //info about played cards is available
                return(<CardsFullInfo playedCards={playedCards} playerInfo={this.props.public.playerInfo} />)
            }
        }
        //show backsides only
        return(<CardPile cards={Array(this.props.public.playedCards.length).fill(backside)} />)
    }

    render() {
        return (
            <div className="board">
                <OpponentList opponents={this.props.others} />
                {this.playedCards()}
                <WatingCommand />
                <Cards cards={this.props.myhand} />
            </div>
        )
    }
}

interface StageProps {
    myhand: string[],
    others: { name: string, cardCount: number }[],
    public: DixitGameState,
    storyTellerName : string,
    onChooseStory?: (phrase: string, image: string) => void
    onChooseCard?: (image: string) => void
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

    cardSelected(src: string) {
        //TODO show error if phrase is empty
        if (!this.props.onChooseStory) {
            throw "this.props.onChooseStory Must be defined";
        }
        this.props.onChooseStory(this.state.phrase, src);
    }

    render() {
        return (
            <div className="board">
                <OpponentList opponents={this.props.others} />
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

    cardSelected(src: string) {
        if (!this.props.onChooseCard) {
            throw "this.props.onChooseCard Must be defined";
        }
        this.props.onChooseCard(src);
    }

    render() {
        return (
            <div className="board">
                <OpponentList opponents={this.props.others} />
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

    cardSelected(src: string) {
        if (!this.props.onChooseCard) {
            throw "this.props.onChooseCard Must be defined";
        }
        this.props.onChooseCard(src);
    }

    render() {
        
        return (
            <div className="board">
                <OpponentList opponents={this.props.others} />
                <VoteCommand player={this.props.storyTellerName} phrase={this.props.public.phrase} />
                <CardsToChoose cards={this.props.public.playedCards.map(x=>x.str)} handler={this.cardSelected} />
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
        return (
            <div className="board">
                <OpponentList opponents={this.props.others} />
                <CardsFullInfo playedCards={this.props.public.playedCards} playerInfo={this.props.public.playerInfo} />
               
            </div>
        )
    }
    //<Cards cards={this.props.myhand} />
}

export class DixitBoard extends React.Component<BoardProps<DixitGameState>, any> {
    render() {
        const opponents = [
            { name: "Mark", cards: 6 },
            { name: "Lisa", cards: 6 },
            { name: "Hugo", cards: 6 }
        ]

        const playerID = this.props.playerID || 'spectating';
        if (!this.props.ctx.activePlayers) {
            return (<div>Error, this.props.ctx.activePlayers not defined</div>)
        }
        const ownCards = this.props.G.players[playerID]?.hand || [];
        const others = Object.keys(this.props.G.playerInfo).filter(x => (x !== this.props.playerID)).map(x => this.props.G.playerInfo[x]);
        const storyteller = this.props.G.playerInfo[this.props.ctx.currentPlayer].name;
        switch (this.props.ctx.activePlayers[playerID]) {
            case undefined:
                return (<StageWaiting myhand={ownCards} others={others} storyTellerName={storyteller} public={this.props.G} />);
            case 'Storytelling':
                return (<StageStorytelling myhand={ownCards} others={others}  storyTellerName={storyteller} public={this.props.G} onChooseStory={this.props.moves.SelectStory} />);
            case 'AddOwnCard':
                return (<StageAddOwnCard myhand={ownCards} others={others} storyTellerName={storyteller} public={this.props.G} onChooseCard={this.props.moves.SelectCard} />);
            case 'VoteStory':
                return (<StageVoteStory myhand={ownCards} others={others}  storyTellerName={storyteller} public={this.props.G} onChooseCard={this.props.moves.VoteCard}/>);
            case 'Finish':
                return (<StageFinish myhand={ownCards} others={others} storyTellerName={storyteller} public={this.props.G} />);
        }
    }
}
//export class DixitBoard extends React.Component<BoardProps<TicTacToeGameState>, never> {}