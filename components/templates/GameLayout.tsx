import { GameStatus } from "../../types/enums";
import { Loading, Spacer } from "@zeit-ui/react";
import PrimaryButton from "../atoms/PrimaryButton";
import { useState } from "react";
import { GameState, ClientGameLibrary, Player } from "../../types/types";
import GameMenu from "../organisms/GameMenu";
import GameSelector from "../organisms/GameSelector";
import PlayerList from "../molecules/PlayerList";

const GameLayout = ({
    gameState,
    path,
    selectedGame,
    onExitGame,
    onStartGame,
    onHostGameLoaded,
    gameLibrary,
    playerList,
    thisPlayer,
}: GameLayoutProps): JSX.Element => {
    const {
        status,
        joinGameURL: { playerURL, hostURL, code },
    } = gameState;

    const { renameParams } = gameLibrary.gameList.find(
        ({ id }) => id == selectedGame
    );

    const { name, isHost } = thisPlayer;

    const paramKeys = {
        rocketcrab: "rocketcrab",
        name: "name",
        ishost: "ishost",
        ...(code ? { code: "code" } : {}),
        ...renameParams,
    };

    const defaultParams = {
        rocketcrab: "true",
        name,
        ishost: isHost.toString(),
        ...(code ? { code } : {}),
    };

    const params = Object.keys(paramKeys).reduce(
        (acc, name) => ({
            ...acc,
            [paramKeys[name]]: defaultParams[name],
        }),
        {}
    );

    const appendToUrl = "?" + new URLSearchParams(params).toString();

    const [statusCollapsed, setStatusCollapsed] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showGameLibrary, setShowGameLibrary] = useState(false);
    const [showPlayerList, setShowPlayerList] = useState(false);

    // https://stackoverflow.com/a/48830513
    const [frameRefresh, setFrameRefresh] = useState(0);

    const showLoading = status === GameStatus.loading;
    const showError = status === GameStatus.error;
    const showWaitingForHost = !isHost && status === GameStatus.waitingforhost;
    const showGameFrame = !isHost && status === GameStatus.inprogress;
    const showHostGameFrame =
        isHost &&
        (status === GameStatus.inprogress ||
            status === GameStatus.waitingforhost);

    const statusClass = "status " + (statusCollapsed ? "status-collapsed" : "");
    return (
        <div className="layout">
            <div className={statusClass}>
                <h4
                    className="logo"
                    onClick={() => {
                        setStatusCollapsed(!statusCollapsed);
                        setShowMenu(false);
                        setShowGameLibrary(false);
                        setShowPlayerList(false);
                    }}
                >
                    🚀🦀
                </h4>
                {!statusCollapsed && (
                    <>
                        <div className="url">rocketcrab.com/{path}</div>
                        <PrimaryButton
                            onClick={() => {
                                setShowMenu(!showMenu);
                                setShowGameLibrary(false);
                                setShowPlayerList(false);
                            }}
                            size="small"
                        >
                            {showMenu ? "▼" : "▲"} Menu
                        </PrimaryButton>

                        {showMenu && (
                            <GameMenu
                                isHost={isHost}
                                onExitGame={() => {
                                    setShowMenu(false);
                                    onExitGame();
                                }}
                                onReloadMine={() => {
                                    setShowMenu(false);
                                    setFrameRefresh(frameRefresh + 1);
                                }}
                                onStartGame={() => {
                                    setShowMenu(false);
                                    onStartGame();
                                }}
                                onViewGames={() => {
                                    setShowMenu(false);
                                    setShowGameLibrary(true);
                                }}
                                onViewPlayers={() => {
                                    setShowMenu(false);
                                    setShowPlayerList(true);
                                }}
                            />
                        )}
                    </>
                )}
            </div>
            {(showLoading || showWaitingForHost) && (
                <div className="frame">
                    <Loading type={showWaitingForHost ? "error" : "default"}>
                        {showWaitingForHost ? (
                            <span>Waiting for host</span>
                        ) : (
                            <span>Loading game</span>
                        )}
                    </Loading>
                </div>
            )}
            {showError && (
                <div className="frame">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                        }}
                    >
                        {gameState.error}
                    </div>
                </div>
            )}
            {showGameFrame && (
                <iframe
                    className="frame"
                    src={playerURL + appendToUrl}
                    key={frameRefresh}
                ></iframe>
            )}
            {showHostGameFrame && (
                <iframe
                    className="frame"
                    src={hostURL + appendToUrl}
                    key={frameRefresh}
                    onLoad={onHostGameLoaded}
                ></iframe>
            )}
            {showGameLibrary && (
                <div className="component-frame">
                    <GameSelector
                        gameLibrary={gameLibrary}
                        onDone={() => setShowGameLibrary(false)}
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        onSelectGame={() => {}}
                        backToLabel="game"
                        isHost={isHost}
                    />
                </div>
            )}
            {showPlayerList && (
                <div className="component-frame">
                    <div>🚀🦀 Players:</div>
                    <Spacer y={0.5} />
                    <PlayerList playerList={playerList} />
                    <Spacer y={0.5} />
                    <PrimaryButton onClick={() => setShowPlayerList(false)}>
                        Close
                    </PrimaryButton>
                </div>
            )}
            <style jsx>{`
                .layout {
                    display: flex;
                    flex-flow: column;
                    height: 100%;
                }
                .status {
                    border-bottom: 1px solid LightGrey;
                    display: flex;
                    justify-content: space-between;
                    align-content: center;
                    padding: 0.5em;
                }
                .status-collapsed {
                    position: fixed;
                    width: fit-content;
                    border-right: 1px solid LightGrey;
                }

                .frame {
                    flex: 1 1 auto;
                    border: 0;
                }
                .logo {
                    margin: 0;
                    user-select: none;
                    cursor: pointer;
                }
                .url {
                    font-size: 1.2em;
                    line-height: 1em;
                    height: 1em;
                    margin: auto 0;
                    font-weight: bold;
                }
                .component-frame {
                    margin: 1em;
                    padding: 1em;
                    text-align: center;
                    position: absolute;
                    right: 1em;
                    top: 3em;
                    background: white;
                    border: 1px solid LightGrey;
                    min-width: 15em;
                    max-width: 100%;
                }
            `}</style>
        </div>
    );
};

type GameLayoutProps = {
    gameState: GameState;
    selectedGame: string;
    path: string;
    onExitGame: () => void;
    onStartGame: () => void;
    onHostGameLoaded: () => void;
    gameLibrary: ClientGameLibrary;
    playerList: Array<Player>;
    thisPlayer: Player;
};

export default GameLayout;
