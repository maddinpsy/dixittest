import * as React from "react";

import backside from "img/backside.png"
import { PlayedCard } from "Game";
import imageLoader from 'images';
import { FullPlayerInfo } from "components/Board"
import { Button } from "components/Button"
import style from "./style.module.scss";
import classNames from "classnames";
import { render } from "react-dom";


export class Cards extends React.Component<{ cards: number[] }, { fullScreenCard?: number }>{
    constructor(props: any) {
        super(props);
        this.state = {};
    }
    render() {
        const list = this.props.cards.map((value, idx) => (
            <div key={idx} className={style.Card__container}>
                <img
                    src={imageLoader()[value]}
                    alt={"CardID:" + value}
                    className={style.Card__image}
                    onClick={() => this.setState({ fullScreenCard: value })}
                />
            </div>
        ))
        return (
            <div className={style.Card__list} >
                { list}
                {this.state.fullScreenCard ?
                    <div className={style.Card__fullscreenContainer} onClick={() => this.setState({ fullScreenCard: undefined })}>
                        <img
                            src={imageLoader()[this.state.fullScreenCard]}
                            alt={"CardID:" + this.state.fullScreenCard}
                            className={style.Card__image} />
                    </div>
                    :
                    ""
                }
            </div>
        )
    }
}

export interface CardsToChooseProps {
    cards: number[],
    handler: (src: number) => void
    animationDestination?: React.RefObject<HTMLDivElement>
}

export class CardsToChoose extends React.Component<CardsToChooseProps, { fullScreenCard?: number }>
{
    imgRefs: { cardID: number, ref: React.RefObject<HTMLImageElement> }[];
    constructor(props: any) {
        super(props);
        this.state = {};
        this.imgRefs = this.props.cards.map(cardID => { return { cardID: cardID, ref: React.createRef() } });
    }

    onSelectCard(cardId: number) {
        //get selected dom image
        const curRef = this.imgRefs.find(o => o.cardID === cardId)?.ref.current;
        if (this.props.animationDestination?.current && curRef) {
            //hide original image
            curRef.style.opacity = "0";
            const ownRect = curRef.getBoundingClientRect();
            //Add new image
            let n = document.createElement('img');
            n.src = curRef.src;
            n.className = style.Card__image;
            n.style.left = ownRect.left + "px";
            n.style.top = ownRect.top + "px";
            n.style.width = ownRect.width + "px";
            n.style.height = ownRect.height + "px";
            n.style.position = "fixed";
            document.body.appendChild(n);
            //start animation after 10ms
            window.setTimeout(() => {
                if (this.props.animationDestination?.current) {
                    const destRect = this.props.animationDestination?.current.getBoundingClientRect();
                    n.style.left = (destRect.left + destRect.width / 2 - ownRect.width / 2) + "px";
                    n.style.top = (destRect.top) + "px";
                    n.style.height = (destRect.height) + "px";
                }
            }, 10);
            //after animation
            n.addEventListener("transitionend", () => {
                n.remove();
                this.props.handler(cardId)
            });
            n.addEventListener("transitioncancel", () => {
                n.remove();
                this.props.handler(cardId)
            });
        } else {
            //could find image or destination: call handler directly
            this.props.handler(cardId);
        }
    }
    setFullScreenCard(cardID?: number) {
        this.setState({ fullScreenCard: cardID })
    }
    render() {
        const list = this.props.cards.map((value, idx) => {
            return (
                <div key={idx} className={style.Card__container}>
                    <img
                        ref={this.imgRefs.find(o => o.cardID === value)?.ref}
                        src={imageLoader()[value]} alt={"CardID:" + value}
                        className={style.Card__image}
                        onClick={() => this.setFullScreenCard(value)}
                    />
                    <Button onClick={() => this.onSelectCard(value)} theme="orange" size="small" >Choose this</Button>
                </div>
            )
        }
        )
        return (
            <div className={style.Card__list}>
                {list}
                {this.state.fullScreenCard ?
                    <div className={style.Card__fullscreenContainer} onClick={() => this.setFullScreenCard()}>
                        <img
                            src={imageLoader()[this.state.fullScreenCard]}
                            alt={"CardID:" + this.state.fullScreenCard}
                            className={style.Card__image} />
                    </div>
                    :
                    ""
                }
            </div>
        )
    }
}


export class CardsFullInfo extends React.Component<{ playedCards: PlayedCard[], playerInfo: FullPlayerInfo, forwardedRef?: React.RefObject<HTMLDivElement>; }, { fullScreenCard?: number }> {
    constructor(props: any) {
        super(props)
        this.state = {}
    }
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
                <img
                    src={value.cardID ? imageLoader()[value.cardID] : backside}
                    alt={"CardID:" + value.cardID}
                    className={style.Card__image}
                    onClick={() => this.setState({ fullScreenCard: value.cardID })}
                />
                {this.voters(value.votedBy)}
            </div>
        ))
        return (
            <div ref={this.props.forwardedRef} className={style.Card__list}>
                {list}
                {this.state.fullScreenCard ?
                    <div className={style.Card__fullscreenContainer} onClick={() => this.setState({ fullScreenCard: undefined })}>
                        <img
                            src={imageLoader()[this.state.fullScreenCard]}
                            alt={"CardID:" + this.state.fullScreenCard}
                            className={style.Card__image} />
                    </div>
                    :
                    ""
                }
            </div>
        )
    }
}
