import * as React from "react";

import style from "./style.module.scss";

export function CardPile(props: { cards: string[] }) {
    const list = props.cards.map((value, idx) => (
        <img src={value} alt={value} key={idx} className={style.Cardpile__image} style={
            {
                transform: 'rotate(' + ((idx - props.cards.length / 2) * -5) + 'deg)',
            }
        } />
    ))
    return (
        <div className={style.Cardpile__container}>
            {list}
        </div>
    )
}