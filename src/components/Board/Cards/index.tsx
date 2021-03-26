import * as React from "react";

import backside from "img/backside.png"
import { PlayedCard } from "Game";
import imageLoader from 'images';
import { FullPlayerInfo } from "components/Board"
import { Button } from "components/Button"
import style from "./style.module.scss";


export function Cards(props: { cards: number[] }) {
    const list = props.cards.map((value, idx) => (
        <div key={idx} className={style.Card__container}>
            <img src={imageLoader()[value]} alt={"CardID:" + value} className={style.Card__image} />
        </div>
    ))
    return (
        <div className={style.Card__list}>
            {list}
        </div>
    )
}

export interface AnimationSetting {
    destClientX: number;
    destClientY: number;
    duration: number;
}

export interface CardsToChooseProps {
    cards: number[],
    handler: (src: number) => void
    animate?: AnimationSetting
}

export class CardsToChoose extends React.Component<CardsToChooseProps, { selectedCard?: number }>
{
    imgRefs: { cardID: number, ref: React.RefObject<HTMLImageElement> }[];
    constructor(props: any) {
        super(props);
        this.imgRefs = this.props.cards.map(cardID => { return { cardID: cardID, ref: React.createRef() } });
    }

    onSelectCard(cardId: number) {
        if (this.props.animate) {
            //get selected dom image
            const curRef = this.imgRefs.find(o => o.cardID === cardId)?.ref.current;
            if (curRef) {
                //hide original image
                curRef.style.opacity = "0";
                const rect = curRef.getBoundingClientRect();
                //Add new image
                let n = document.createElement('img');
                n.src = curRef.src;
                n.className = style.Card__image ;
                n.style.left = rect.left + "px";
                n.style.top = rect.top + "px";
                n.style.width = rect.width + "px";
                n.style.height = rect.height + "px";
                n.style.position = "fixed";
                document.body.appendChild(n);
                //start animation
                n.style.transition = "300ms ease all"
                window.setTimeout(() => {
                    n.style.left = this.props.animate?.destClientX + "px";
                    n.style.top = this.props.animate?.destClientY + "px";
                }, 10);
                //after animation
                window.setTimeout(() => {
                    n.remove();
                    this.props.handler(cardId)
                }, this.props.animate.duration);
            }else{
                //could find image: call handler
            this.props.handler(cardId);
        }
        } else {
            //direct call
            this.props.handler(cardId);
        }
    }

    render() {
        const list = this.props.cards.map((value, idx) => {
            return (
                <div key={idx} className={style.Card__container}>
                    <img ref={this.imgRefs.find(o => o.cardID === value)?.ref} src={imageLoader()[value]} alt={"CardID:" + value} className={style.Card__image} />
                    <Button onClick={() => this.onSelectCard(value)} theme="orange" size="small" >Choose this</Button>
                </div>
            )
        }
        )
        return (
            <div className={style.Card__list}>
                {list}
            </div>
        )
    }
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
                <img src={value.cardID?imageLoader()[value.cardID]:backside} alt={"CardID:" + value.cardID} className={style.Card__image} />
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
