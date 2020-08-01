import { ServerGame } from "../../types/types";
import { postJson } from "../../utils/utils";

const game: ServerGame = {
    name: "Spyfall",
    author: "Tanner Krewson",
    description: "formerly Crabhat",
    displayUrlText: "spyfall.tannerkrewson.com",
    displayUrlHref: "https://spyfall.tannerkrewson.com/",
    category: ["deduction"],
    players: "4+",
    familyFriendly: true,
    minPlayers: 1,
    maxPlayers: Infinity,
    getJoinGameUrl: async () => {
        const newUrl = "https://spyfall.tannerkrewson.com/new";
        const { gameCode } = await postJson(newUrl);
        return {
            playerURL: "https://spyfall.tannerkrewson.com/" + gameCode,
        };
    },
};

export default game;
