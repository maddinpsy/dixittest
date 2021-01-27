import { count } from "console";
import * as React from "react";

import backside from './img/backside.png';
import card1 from './img/DIXIT_1_WALLPAPER_SMARTPHONE_1.jpg';
import card2 from './img/DIXIT_1_WALLPAPER_SMARTPHONE_2.jpg';
import card3 from './img/DIXIT_1_WALLPAPER_SMARTPHONE_3.jpg';
import card4 from './img/DIXIT_2_WALLPAPER_SMARTPHONE_1.jpg';
import card5 from './img/DIXIT_2_WALLPAPER_SMARTPHONE_2.jpg';
import card6 from './img/DIXIT_2_WALLPAPER_SMARTPHONE_3.jpg';

function Opponent(props:{name:string,cards:number})
{ 
    const images = Array.from(Array(props.cards).keys()).map(idx=>(
        <img src={backside} alt="backside" key={idx} style={{transform: 'rotate('+((idx-props.cards/2)*-5)+'deg)'}}/>
    ))
    return (
        <div className="opponent">
            {images}
            <h1>{props.name}</h1>
        </div>
    )
}

function OpponentList(props:{opponents:{name:string,cards:number}[]})
{
    const listOp = props.opponents.map((op,idx)=>(
        <Opponent name={op.name} cards={op.cards} key={idx}/>
    ));
    return (
        <div className="opponentList">
            {listOp}
        </div>
    )
}

function PublicCards(props:{count:number})
{
    function remove(id:number){
        let el=document.querySelector("#public"+id);
        el?.classList.add("hidden");
    }

    const images = Array.from(Array(10).keys()).map(idx=>(
        <img src={backside} alt="backside" key={idx} id={"public"+idx} onClick={()=>remove(idx)}/>
    ))
    return (
        <div className="publicCards">
            {images}
        </div>
    )
}

function Command(props:any)
{
    return (
        <div className="command">
            <div>Enter a phrase:</div>
            <input />
            <div>And choose a card:</div>
        </div>
    )
}

function OwnCards(props:{cards:string[]})
{
    function remove(id:number){
        let el=document.querySelector("#owncard"+id);
        el?.classList.add("hidden");
    }

    const list=props.cards.map((value,idx)=>(
        <div key={idx} id={"owncard"+idx}>
            <img src={value}/>
            <br/>
            <button onClick={()=>remove(idx)}>Choose this</button> 
        </div>
    ))
    return (
        <div className="handcards">
        {list}
        </div>
    )
}

export function DixitBoard(){
    const opponents = [
        {name:"Mark",cards:6},
        {name:"Lisa",cards:6},
        {name:"Benny",cards:6}
    ]

    const handcards = [card1,card2,card3,card4,card5,card6]

    return (
        <div className="board">
            <OpponentList opponents={opponents}/>
            <PublicCards count={5}/>
            <Command/>
            <OwnCards cards={handcards}/>
        </div>
    )
}
//export class DixitBoard extends React.Component<BoardProps<TicTacToeGameState>, never> {}