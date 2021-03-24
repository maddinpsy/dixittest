import * as React from "react";

import {PlayedCard } from "Game";
import imageLoader from 'images';
import {FullPlayerInfo} from "components/Board"
import {Button} from "components/Button"
import style from "./style.module.scss";


export function Cards(props: { cards: number[] }) {
    const list = props.cards.map((value, idx) => (
        <div key={idx} className={style.Card__container}>
            <img src={imageLoader()[value]} alt={"CardID:" + value} className={style.Card__image}/>
        </div>
    ))
    return (
        <div className={style.Card__list}>
            {list}
        </div>
    )
}


export function CardsToChoose(props: { cards: number[], handler: (src: number) => void }) {
    const list = props.cards.map((value, idx) => (
        <div key={idx} className={style.Card__container}>
            <img src={imageLoader()[value]} alt={"CardID:" + value} className={style.Card__image}/>
            <Button onClick={() => props.handler(value)} theme="orange" size="small" >Choose this</Button>
        </div>
    ))
    return (
        <div className={style.Card__list}>
            {list}
        </div>
    )
}


export class CardsFullInfo extends React.Component<{ playedCards: PlayedCard[], playerInfo: FullPlayerInfo }> {
    mapToName(playerID?: string): string {
        const name = this.props.playerInfo.find(p => p.playerID === playerID)?.nickname;
        if (name === undefined) {
            return "...";
        }
        return name;
    }
    voters(votedBy: string[]) {
        if (votedBy.length === 0) {
            return (<div>not voted</div>);
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
            <div key={idx} className={style.Card__container}>
                <div>Played by: {this.mapToName(value.playedBy)}</div>
                <img src={imageLoader()[value.cardID]} alt={"CardID:" + value.cardID} className={style.Card__image} />
                {this.voters(value.votedBy)}
            </div>
        ))
        return (
            <div className={style.Card__list}>
                {list}
            </div>
        )
    }
}