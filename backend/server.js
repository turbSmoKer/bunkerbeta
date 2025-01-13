const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let gameState = {
    scenario: {
        catastrophe: "Глобальная пандемия вируса, уничтожившая большинство населения.",
        bunkerLocation: "Под старым заводом",
        area: "200 кв. м",
        timeInBunker: "3 месяца",
        inventory: ["Продукты питания", "Аптечка", "Оружие"],
        peoples: "10",
    },
    cards: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        playerName: `Игрок ${i + 1}`,
        attributes: {
            health: "Здоровье: хорошее",
            profession: "Инженер",
            hobby: "Шахматы",
            age: "30 лет",
            phobia: "Высота",
        },
        revealed: {
            health: false,
            profession: false,
            hobby: false,
            age: false,
            phobia: false,
        },
    })),
};

wss.on("connection", (ws) => {
    // Отправляем начальное состояние игры
    ws.send(JSON.stringify({ type: "INIT", gameState }));

    ws.on("message", (message) => {
        const { type, data } = JSON.parse(message);

        if (type === "REVEAL_ATTRIBUTE") {
            const { cardId, attribute } = data;
            gameState.cards = gameState.cards.map((card) =>
                card.id === cardId
                    ? { ...card, revealed: { ...card.revealed, [attribute]: true } }
                    : card
            );
            broadcast({ type: "UPDATE_GAME", gameState });
        }

        if (type === "UPDATE_PLAYER_NAME") {
            const { cardId, playerName } = data;
            gameState.cards = gameState.cards.map((card) =>
                card.id === cardId ? { ...card, playerName } : card
            );
            broadcast({ type: "UPDATE_GAME", gameState });
        }

        if (type === "REMOVE_PLAYER") {
            const { cardId } = data;
            gameState.cards = gameState.cards.filter((card) => card.id !== cardId);
            broadcast({ type: "UPDATE_GAME", gameState });
        }

        if (type === "REGENERATE_SCENARIO") {
            gameState.scenario = generateRandomScenario();
            broadcast({ type: "UPDATE_GAME", gameState });
        }
    });
});

// Рассылка сообщений всем подключенным клиентам
const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

// Генерация случайного сценария
const generateRandomScenario = () => ({
    catastrophe: "Новая катастрофа",
    bunkerLocation: "Новое место",
    area: "300 кв. м",
    timeInBunker: "2 месяца",
    inventory: ["Еда", "Вода", "Аптечка"],
    peoples: "100",
});
