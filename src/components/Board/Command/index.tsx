import * as React from "react";

import style from "./style.module.scss";

export class StoryTellingCommand extends React.Component<{ phrase: string, onChange: (phrase: string) => void }> {
    onChange = (e: React.FormEvent<HTMLInputElement>): void => {
        this.props.onChange(e.currentTarget.value);
    };
    render() {
        return (
            <div className={style.Command__command}>
                <div>Choose a pharse:</div>
                <input type="text" value={this.props.phrase} onChange={this.onChange} className={style.Command__commandInput}/>
                <div>And select a card:</div>
            </div>
        );
    }
}

export function ChoseCommand(props: { phrase: string }) {
    return (
        <div className={style.Command__command}>
            <div>Select a card matching the pharse <i>{props.phrase}</i></div>
        </div>
    )
}

export function VoteCommand(props: { player: string, phrase: string }) {
    return (
        <div className={style.Command__command}>
            <div>{props.player} chose the pharse: {props.phrase}</div>
            <div>Select the card he played:</div>
        </div>
    )
}

export function WatingCommand() {
    return (
        <div className={style.Command__command}>
            <div>Waiting for other players</div>
        </div>
    )
}