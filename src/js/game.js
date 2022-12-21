import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import '../../style.css'

console.log("Test2233")

//#region SignalR
var url = "https://localhost:7119";
export const connection = new HubConnectionBuilder()
    .withUrl(url + "/gameHub", {accessTokenFactory: () => JSON.parse(localStorage.getItem('user')).token})
    .configureLogging(LogLevel.Warning)
    .build();

;


export async function startConnection() {
    console.log("Starting connection")

    try {
        await connection.start();
        console.log("SignalR Connected.");
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
};

connection.onclose(async () => {
    await startConnection();
});

connection.on("ReceiveCreatedMessage", (player, game) => {
    document.getElementById("home").hidden = true;
    document.getElementById("lobby").hidden = false;
    console.log(game)
    document.getElementById("gameinfo").innerText = JSON.stringify(game)
    document.getElementById("playerinfo").innerText = JSON.stringify(player)
});

connection.on("ReceiveMessage", (message) => {
    document.getElementById("home").hidden = true;
    document.getElementById("lobby").hidden = false;
    document.getElementById("messages").innerHTML += "<li>"+ message +"</li>"
});

connection.on("ReceiveStartedMessage", (message) => {
    document.getElementById("home").hidden = true
    document.getElementById("lobby").hidden = true
    document.getElementById("game").hidden = false
});

connection.on("CurrentUser", (user) => {
    document.getElementById("currentUser").innerText = JSON.stringify(user)
});

connection.on("CurrentGame", (game) => {
    document.getElementById("gameinfo").innerText = JSON.stringify(game)
});

connection.on("Error", (message) => {
    document.getElementById("errors").innerHTML += "<li>"+message+"</li>"
});

//#endregion

document.getElementById("CreateGame").addEventListener("click", createGame)

async function createGame(){
    document.getElementById("CreateGame").disabled = true
    
    try {
        if(connection.state == HubConnectionState.Disconnected){
            await startConnection();
        }
    	await connection.invoke("CreateGame");
        
        document.getElementById("CreateGame").disabled = false
    } catch (err) {
    	console.error(err);
    }
}

startConnection();

var LoginForm = document.getElementById("joinGameForm")

LoginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    Join();
})

var gameId = document.getElementById("gameId").value
document.getElementById("gameId").addEventListener("onchange", v => {
    gameId = v.value
} )


async function Join(e) {
    document.getElementById("joinGameForm").disabled = true

    gameId = document.getElementById("gameId").value

    try {
        if(connection.state == HubConnectionState.Disconnected){
            await startConnection();
        }
    	await connection.invoke("JoinGame", parseInt(gameId));
        
        
        document.getElementById("joinGameForm").disabled = false
    } catch (err) {
    	console.error(err);
    }
}

var startGameForm = document.getElementById("startGameForm")

startGameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    StartGameFunction();
})

async function StartGameFunction(e) {
    document.getElementById("startGameForm").disabled = true
    
    gameId = document.getElementById("gameId").value

    console.log(connection.state)

    try {
        if(connection.state == HubConnectionState.Disconnected){
            await startConnection();
        }
        console.log(parseInt(gameId))
    	await connection.invoke("StartTheGame", parseInt(gameId));
        
        
        document.getElementById("startGameForm").disabled = false
    } catch (err) {
    	console.error(err);
    }
}

window.onload = () => {
    document.getElementById("errors").innerHTML = ""
}