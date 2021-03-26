import * as React from "react";

import style from "./style.module.scss";


type CardPileProps={ 
    cards: string[] 
    setPosition?:(pos:{clientLeft:number,clientTop:number,height:number})=>void;
};

export class CardPile extends React.Component<CardPileProps>
{
    cardpileRef: React.RefObject<HTMLDivElement>;

    constructor(props:any){
        super(props);
        this.cardpileRef = React.createRef();
    }

    componentDidMount(){
        if(!this.cardpileRef.current)
            throw new Error("cardpileRef is null: this should never happen");
        const rect = this.cardpileRef.current.getBoundingClientRect()
        if(this.props.setPosition)
        this.props.setPosition({clientLeft:rect.left+rect.width/2,clientTop:rect.top+rect.height/2,height:rect.height});
    }

    render(){
    const list = this.props.cards.map((value, idx) => (
        <img src={value} alt={value} key={idx} className={style.Cardpile__image} style={
            {
                transform: 'rotate(' + ((idx - this.props.cards.length / 2) * -5) + 'deg)',
            }
        } />
    ))
    return (
        <div ref={this.cardpileRef} className={style.Cardpile__container}>
            {list}
        </div>
    )
    }
}
