import * as React from "react";
import { SetupNickname } from "components/SetupNickname";
import { App } from "App";

export interface NicknameProps {
    nickname: string;
    requestChangeNickname: () => void;
}

interface State {
    nickname: string;
    changeRequested: boolean;
}

const NICKNAME_STORAGE_KEY = "DIXIT_NICKNAME"

export class NicknameOverlay extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            nickname: '',
            changeRequested: false
        };
        this.setNickname = this.setNickname.bind(this);
        this.onRequestChange = this.onRequestChange.bind(this);
        this.resetRequest = this.resetRequest.bind(this);
    }

    componentDidMount() {
        const savedNickname = localStorage.getItem(NICKNAME_STORAGE_KEY);
        if (savedNickname) {
            this.setState({ nickname: savedNickname });
        }
    }

    setNickname(newNickname: string) {
        this.setState({ nickname: newNickname });
        this.setState({ changeRequested: false });
        localStorage.setItem(NICKNAME_STORAGE_KEY, newNickname);
    }

    onRequestChange() {
        this.setState({ changeRequested: true });
    }

    resetRequest() {
        this.setState({ changeRequested: false });
    }

    render(): JSX.Element {
        let result;
        //if no nickname is set or nickname change is requested
        if (this.state.changeRequested) {
            // show nickname dilaog
            result = (
                <div>
                    <SetupNickname nickname={this.state.nickname} onSubmit={this.setNickname} onBack={this.resetRequest} />
                </div>
            )
        } else {
            // show wrapped component
            result = (
                <App {...this.state} requestChangeNickname={this.onRequestChange} />
            );
        }

        return (result);
    }
}
