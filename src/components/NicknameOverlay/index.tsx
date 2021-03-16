import * as React from "react";
import { SetupNickname } from ".";

export interface InjectedProps {
    nickname: string;
    requestChangeNickname: () => void;
}

interface State {
    nickname: string;
    changeRequested: boolean;
}

const NICKNAME_STORAGE_KEY = "DIXIT_NICKNAME"

export const NicknameHOC = function <TOriginalProps extends {}>(
    Component: React.ComponentClass<TOriginalProps & InjectedProps>) {
    return (
        class NicknameHOC extends React.Component<TOriginalProps, State> {
            static displayName = `NicknameHOC(${Component.displayName || Component.name})`;

            constructor(props: TOriginalProps) {
                super(props);
                this.state = {
                    nickname: '',
                    changeRequested: false
                };
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
                if (this.state.nickname.trim().length === 0 || this.state.changeRequested) {
                    // show nickname dilaog
                    result = (
                        <div>
                            <SetupNickname nickname={this.state.nickname} onSubmit={this.setNickname} onBack={this.resetRequest} />
                            <Component {...this.props} {...this.state} requestChangeNickname={this.onRequestChange} />
                        </div>
                    )
                } else {
                    // show wrapped component
                    result = (
                        <Component {...this.props} {...this.state} requestChangeNickname={this.onRequestChange} />
                    );
                }

                return (result);
            }
        }
    )
}

//usage
//const newApp = NicknameHOC(App)