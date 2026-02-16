using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Linq;

namespace Strategie_Spiel
{
    public class GameHub : Hub
    {
        private static ConcurrentDictionary<string, Player> players = new();
        private static GameState gameState = new();
        private static readonly object lockObj = new object();

        public async Task JoinLobby(string playerName)
        {
            if (players.Count >= 4)
            {
                await Clients.Caller.SendAsync("LobbyFull");
                return;
            }

            var player = new Player
            {
                ConnectionId = Context.ConnectionId,
                Name = playerName,
                UnitIndex = players.Count // 0,1,2,3
            };

            players[Context.ConnectionId] = player;
            await Groups.AddToGroupAsync(Context.ConnectionId, "lobby");

            await Clients.Group("lobby").SendAsync("LobbyUpdate", players.Values.Select(p => new { p.Name, p.UnitIndex }));

            if (players.Count == 4)
            {
                await StartGame();
            }
        }

        private async Task StartGame()
        {
            gameState = new GameState();
            var unitPositions = new (int x, int y)[] { (1, 1), (18, 18), (1, 18), (18, 1) };
            int i = 0;
            foreach (var player in players.Values)
            {
                var pos = unitPositions[i];
                gameState.Units.Add(new UnitState
                {
                    PlayerIndex = i,
                    GridX = pos.x,
                    GridY = pos.y,
                    ColorKey = new[] { "RED", "GREEN", "BLUE", "YELLOW" }[i]
                });
                i++;
            }

            gameState.InitializeTiles();

            var playerList = players.Values.Select(p => new { p.ConnectionId, p.UnitIndex }).ToList();
            await Clients.Group("lobby").SendAsync("GameStarted", gameState, playerList);
        }

        public async Task MoveUnit(int newX, int newY)
        {
            if (!players.TryGetValue(Context.ConnectionId, out var player))
                return;

            lock (lockObj)
            {
                var unit = gameState.Units.FirstOrDefault(u => u.PlayerIndex == player.UnitIndex);
                if (unit == null) return;

                var tile = gameState.Tiles.FirstOrDefault(t => t.GridX == newX && t.GridY == newY);
                if (tile == null || tile.TerrainKey == "WATER" || tile.TerrainKey == "MOUNTAIN")
                    return;

                unit.GridX = newX;
                unit.GridY = newY;
            }

            await Clients.All.SendAsync("UnitMoved", player.UnitIndex, newX, newY);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (players.TryRemove(Context.ConnectionId, out var player))
            {
                await Clients.Group("lobby").SendAsync("PlayerLeft", player.Name);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }

    public class Player
    {
        public string ConnectionId { get; set; }
        public string Name { get; set; }
        public int UnitIndex { get; set; }
    }

    public class GameState
    {
        public List<TileState> Tiles { get; set; } = new();
        public List<UnitState> Units { get; set; } = new();
        public List<BuildingState> Buildings { get; set; } = new();

        public void InitializeTiles()
        {
            var rand = new Random();
            for (int i = 0; i < 20; i++)
            {
                for (int j = 0; j < 20; j++)
                {
                    double r = rand.NextDouble();
                    string terrain;
                    if (r < 0.1) terrain = "MOUNTAIN";
                    else if (r < 0.25) terrain = "FOREST";
                    else if (r < 0.3) terrain = "WATER";
                    else if (r < 0.35) terrain = "TRAP";
                    else terrain = "PLAINS";

                    Tiles.Add(new TileState { GridX = j, GridY = i, TerrainKey = terrain });
                }
            }
        }
    }

    public class TileState
    {
        public int GridX { get; set; }
        public int GridY { get; set; }
        public string TerrainKey { get; set; }
        public bool Explored { get; set; }
    }

    public class UnitState
    {
        public int PlayerIndex { get; set; }
        public int GridX { get; set; }
        public int GridY { get; set; }
        public string ColorKey { get; set; }
    }

    public class BuildingState
    {
        public int GridX { get; set; }
        public int GridY { get; set; }
        public int Level { get; set; }
        public int OwnerIndex { get; set; }
    }
}