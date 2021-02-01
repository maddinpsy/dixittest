import * as React from "react";
import backside from './img/backside.png';

import { BoardProps } from "boardgame.io/react";
import { DixitGameState } from "./Game";

function Opponent(props: { name: string, cards: number }) {
    return (
        <div className="opponent">
            <CardPile cards={Array<string>(props.cards).fill(backside)} size="100px" />
            <h1>{props.name}</h1>
        </div>
    )
}

function OpponentList(props: { opponents: { name: string, cards: number }[] }) {
    const listOp = props.opponents.map((op, idx) => (
        <Opponent name={op.name} cards={op.cards} key={idx} />
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

function CardPile(props: { cards: string[], size: string }) {
    const list = props.cards.map((value, idx) => (
        <img src={value} alt={value} key={idx} style={
            {
                transform: 'rotate(' + ((idx - props.cards.length / 2) * -5) + 'deg)',
                height: props.size
            }
        } />
    ))
    return (
        <div className="cardpile">
            {list}
        </div>
    )
}

function Command(props: any) {
    return (
        <div className="command">
            <div>Enter a phrase:</div>
            <input />
            <div>And choose a card:</div>
        </div>
    )
}

function CardsToChoose(props: { cards: string[], handler: (idx: number) => void }) {
    const list = props.cards.map((value, idx) => (
        <div key={idx}>
            <img src={value} alt={value} />
            <br />
            <button onClick={() => props.handler(idx)}>Choose this</button>
        </div>
    ))
    return (
        <div className="cards">
            {list}
        </div>
    )
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
        return (
            <div className="board">
                <OpponentList opponents={opponents} />
                <CardPile cards={[backside, backside, backside, backside]} size="200px" />
                <Command />
                <CardsToChoose cards={this.props.G.players[playerID].hand} handler={(idx: number) => { }} />
            </div>
        )
    }
}
//export class DixitBoard extends React.Component<BoardProps<TicTacToeGameState>, never> {}