import React from "react";
import { FullPlayerInfo } from "components/Board";
import "./style.scss";
interface ScoreBoardProps {
    playerID: string
    playerInfos: FullPlayerInfo
    remainingCards: number
}

export class ScoreBoard extends React.Component<ScoreBoardProps>
{
    render() {
        const remaintingRounds = Math.floor(this.props.remainingCards / this.props.playerInfos.length);
        let remaintingRoundsText;
        switch (remaintingRounds) {
            case 0:
                remaintingRoundsText = "End of Game"
                break;
            case 1:
                remaintingRoundsText = "Last Round"
                break;
            default:
                remaintingRoundsText = remaintingRounds + " rounds remaining";
        }
        const playerScores = this.props.playerInfos.map((player) =>
            <div key={player.playerID} className="ScoreBoard__player">
                <span>
                    {player.nickname} {player.playerID === this.props.playerID && "(You)"}
                </span>
                <span className="ScoreBoard__points">
                    {player.score}
                </span>
            </div>
        );
        return (
            <div className="ScoreBoard__box">
                {playerScores}
                <div className="ScoreBoard__rounds">
                    {remaintingRoundsText}
                </div>
            </div>
        )
    }
}