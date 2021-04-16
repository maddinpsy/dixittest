import * as React from "react";

import style from "./style.module.scss";


type CardPileProps = {
    cards: string[]
    containerRef?: React.RefObject<HTMLDivElement>;
};

export class CardPile extends React.Component<CardPileProps>
{

    constructor(props: any) {
        super(props);
    }


    render() {
        const list = this.props.cards.map((value, idx) => (
            <img src={value} alt={value} key={idx} className={style.Cardpile__image} style={
                {
                    transform: 'rotate(' + ((idx - this.props.cards.length / 2) * -5) + 'deg)',
                }
            } />
        ))
        return (
            <div ref={this.props.containerRef} className={style.Cardpile__container}>
                {list}
            </div>
        )
    }
}