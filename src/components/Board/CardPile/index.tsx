import * as React from "react";

import style from "./style.module.scss";


type CardPileProps = {
    cards: string[]
    forwardedRef?: React.RefObject<HTMLDivElement>;

    animationDestination?: React.RefObject<HTMLDivElement>
};

export class CardPile extends React.Component<CardPileProps>
{
    containerRef: React.RefObject<HTMLDivElement>;
    constructor(props: any) {
        super(props);
        if (this.props.forwardedRef) {
            this.containerRef = this.props.forwardedRef;
        } else {
            this.containerRef = React.createRef();
        }
    }

    componentDidUpdate(oldProps: CardPileProps) {
        //when a card gets removed
        if (oldProps.cards.length > this.props.cards.length) {
            //if all containers are set
            const curRef = this.containerRef.current;
            if (this.props.animationDestination?.current && curRef) {
                const removedCard = oldProps.cards.find(x => this.props.cards.indexOf(x) === -1) || oldProps.cards[0];
                if (removedCard) {
                    //add new image to document (at same size and position)
                    const ownRect = curRef.getBoundingClientRect();
                    let n = document.createElement('img');
                    n.src = removedCard;
                    n.className = style.Cardpile__image;
                    n.style.left = ownRect.left + ownRect.width / 2+ "px";
                    n.style.top = ownRect.top + "px";
                    //n.style.width = ownRect.width + "px";
                    n.style.height = ownRect.height + "px";
                    n.style.position = "fixed";
                    document.body.appendChild(n);
                    //start animation after 10ms
                    window.setTimeout(() => {
                        if (this.props.animationDestination?.current) {
                            const destRect = this.props.animationDestination?.current.getBoundingClientRect();
                            n.style.left = (destRect.left + destRect.width / 2) + "px";
                            n.style.top = (destRect.top) + "px";
                            n.style.height = (destRect.height) + "px";
                        }
                    }, 10);
                    //after animation
                    n.addEventListener("transitionend", () => {
                        n.remove();
                    });
                    n.addEventListener("transitioncancel", () => {
                        n.remove();
                    });
                }
            }
        }
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
            <div ref={this.containerRef} className={style.Cardpile__container}>
                {list}
            </div>
        )
    }
}