import * as React from "react";
import backside from './backside.png';

import { BoardProps } from "boardgame.io/react";
import { DixitGameState } from "./Game";

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
        <div key={idx}>
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

class StoryTellingCommand extends React.Component<{ phrase: string , onChange:(phrase:string)=>void}> {
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

function ChoseCommand(props: { player: string, phrase: string }) {
    return (
        <div className="command">
            <div>{props.player} chose the pharse: {props.phrase}</div>
            <div>Select a card matching that phrase:</div>
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
        <div key={idx}>
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

class StageWaiting extends React.Component<{ G: DixitGameState, playerID: string }> {
    render() {
        return (
            <div className="board">
                <OpponentList opponents={Object.keys(this.props.G.playerInfo).filter(x=>(x!=this.props.playerID)).map(x=>this.props.G.playerInfo[x])} />
                <CardPile cards={Array(this.props.G.playedCardCount).fill(backside)} />
                <WatingCommand />
                <Cards cards={this.props.G.players[this.props.playerID].hand} />
            </div>
        )
    }
}


class StageStorytelling extends React.Component<{ G: DixitGameState, playerID: string, onChoose: (phrase: string, image: string) => void },{phrase:string, image:string}> {
    constructor(props: any) {
        super(props);
        this.state = { phrase: '', image: '' };
        this.phraseChanged = this.phraseChanged.bind(this);
        this.cardSelected = this.cardSelected.bind(this);
    }

    phraseChanged(phrase:string) {
        this.setState({phrase:phrase});
    }

    cardSelected(src:string) {
        this.setState({image:src});
        //TODO show error if phrase is empty
        this.props.onChoose(this.state.phrase,src);
    }

    render() {
        return (
            <div className="board">
                <OpponentList opponents={Object.keys(this.props.G.playerInfo).filter(x=>(x!=this.props.playerID)).map(x=>this.props.G.playerInfo[x])} />
                <CardPile cards={Array(this.props.G.playedCardCount).fill(backside)} />
                <StoryTellingCommand onChange={this.phraseChanged} phrase={this.state.phrase}/>
                <CardsToChoose cards={this.props.G.players[this.props.playerID].hand} handler={this.cardSelected} />
            </div>
        )
    }
}

function StageAddOwnCard(){
    return (<div>"not yet done"</div>);
}

function StageVoteStory(){
    return (<div>"not yet done"</div>);
}

function StageFinish(){
    return (<div>"not yet done"</div>);
}

export class DixitBoard extends React.Component<BoardProps<DixitGameState>, any> {
    render() {
        const opponents = [
            { name: "Mark", cards: 6 },
            { name: "Lisa", cards: 6 },
            { name: "Hugo", cards: 6 }
        ]

        const playerID = this.props.playerID || '';
        console.log(playerID);
        if (!this.props.ctx.activePlayers) {
            return (<div>Error, this.props.ctx.activePlayers not defined</div>)
        }

        switch (this.props.ctx.activePlayers[playerID]) {
            case undefined:
            case 'Waiting':
                return (<StageWaiting G={this.props.G} playerID={playerID} />);
            case 'Storytelling':
                return (<StageStorytelling G={this.props.G} playerID={playerID} onChoose={this.props.moves.SelectStory} />);
            case 'AddOwnCard':
                return (<StageAddOwnCard />);
            case 'VoteStory':
                return (<StageVoteStory />);
            case 'Finish':
                return (<StageFinish />);
        }
    }
}
//export class DixitBoard extends React.Component<BoardProps<TicTacToeGameState>, never> {}