import * as React from "react";

import backside from 'img/backside.png';
import style from "./style.module.scss";
import {CardPile} from "../CardPile"
import {FullPlayerInfo} from "components/Board"

export function Opponent(props: { name: string, cards: number , animationDestination?:React.RefObject<HTMLDivElement> }) {
    return (
        <div className={style.Opponent__opponent}>
            <CardPile cards={Array<string>(props.cards).fill(backside)} animationDestination={props.animationDestination}  />
            <h1>{props.name}</h1>
        </div>
    )
}

export function OpponentList(props: { opponents: FullPlayerInfo, animationDestination?:React.RefObject<HTMLDivElement> }) {
    const listOp = props.opponents.map((op, idx) => (
        <Opponent name={op.nickname} cards={op.cardCount} key={idx} animationDestination={props.animationDestination} />
    ));
    return (
        <div className={style.Opponent__opponentList}>
            {listOp}
        </div>
    )
}