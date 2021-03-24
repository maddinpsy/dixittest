import React from "react";
import { FullPlayerInfo } from "components/Board";
import "./style.scss";
interface ScoreBoardProps {
    playerID: string
    playerInfos: FullPlayerInfo
}

export class ScoreBoard extends React.Component<ScoreBoardProps>
{
    render() {
        return (
            <div className="ScoreBoard__box">
                {
                    this.props.playerInfos.map((player) => {
                        return (
                            <div key={player.playerID} className="ScoreBoard__player">
                                <span>
                                    {player.nickname} {player.playerID === this.props.playerID && "(You)"}
                                </span>
                                <span className="ScoreBoard__points">
                                    {player.score}
                                </span>
                            </div>
                        );
                    }
                    )}
            </div>
        )
    }
}