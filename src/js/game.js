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
    sessionStorage.setItem('game', JSON.stringify(game))
    console.log(game)
    // document.getElementById("gameinfo").innerText = JSON.stringify(game)
    // document.getElementById("playerinfo").innerText = JSON.stringify(player)
});

connection.on("ReceiveMessage", (message) => {
    document.getElementById("home").hidden = true;
    document.getElementById("lobby").hidden = false;
    document.getElementById("messages").innerHTML += "<li>"+ message +"</li>"
});

connection.on("ReceiveStartedMessage", (message) => {
    console.log(message);
    document.getElementById("home").hidden = true
    document.getElementById("lobby").hidden = true
    document.getElementById("game").hidden = false
});

connection.on("CurrentUser", (user, options) => {
    document.getElementById("currentUser").innerText = JSON.stringify(user)
    sessionStorage.setItem('currentUser', user)
    sessionStorage.setItem('options', JSON.stringify(options))
    setButtons(options)

    if(user == "Game has ended"){
        document.getElementById("newRoundBTN").hidden = false
    }else{
        document.getElementById("newRoundBTN").hidden = true
    }

});

connection.on("CurrentGameMessage", (game, message) => {
    sessionStorage.setItem('game', JSON.stringify(game))
    console.log(message)
    SetPlayersDiv()
    // document.getElementById("gameinfo").innerText = JSON.stringify(game)
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

async function Join(e) {
    document.getElementById("joinGameForm").disabled = true

    if(JSON.parse(localStorage.getItem('user')) == null){
        window.location.replace("/");
        return;
    }

    console.log(document.getElementById("gameId").value)

    var gameId = document.getElementById("gameId").value

    if(gameId == 0 || gameId == NaN){
        window.location.replace("/");
        return;
    }

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
    
    if(JSON.parse(localStorage.getItem('user')) == null){
        window.location.replace("/");
        return;
    }

    var gameId = JSON.parse(sessionStorage.getItem('game')).gameId

    console.log(connection.state)

    try {
        if(connection.state == HubConnectionState.Disconnected){
            await startConnection();
        }
        console.log(parseInt(gameId))
        console.log(JSON.parse(sessionStorage.getItem('game')).gameId)
    	await connection.invoke("StartTheGame", parseInt(gameId));
        
        
        document.getElementById("startGameForm").disabled = false
    } catch (err) {
    	console.error(err);
    }
}


document.getElementById("hitBTN").addEventListener("click", () => gameOptions("hit"))
document.getElementById("standBTN").addEventListener("click", () => gameOptions("stand"))
document.getElementById("doubleBTN").addEventListener("click", () => gameOptions("double"))
document.getElementById("splitBTN").addEventListener("click", () => gameOptions("split"))

async function gameOptions(option) {
    if(JSON.parse(localStorage.getItem('user')) == null){
        window.location.replace("/");
        return;
    }

    if(JSON.parse(sessionStorage.getItem('game')) == null){
        window.location.replace("/src/html/game.html");
        return;
    }

    console.log(JSON.parse(sessionStorage.getItem('game')).gameId)
    var gameId = JSON.parse(sessionStorage.getItem('game')).gameId

    console.log(connection.state)

    try {
        if(connection.state == HubConnectionState.Disconnected){
            await startConnection();
        }
        console.log(parseInt(gameId))
        console.log(JSON.parse(sessionStorage.getItem('game')).gameId)
    	await connection.invoke("UserChoice", option, parseInt(gameId));
        
    } catch (err) {
    	console.error(err);
    }
}

window.onload = () => {
    document.getElementById("errors").innerHTML = ""
    document.getElementById("newRoundBTN").hidden = true
}

function SetPlayersDiv(){
    var gameData = JSON.parse(sessionStorage.getItem('game'))
    if(gameData == null){
        return;
    }
    
    var playersInGame = gameData.playersInGame
    var playersSection = document.getElementById("player")
    playersSection.innerHTML = ""

    playersInGame.forEach(element => {
        var handen = `<ul style="list-style: none;">`;

        element.hands.forEach(element => {
            var kaartenInHand = ``;
            element.cardsInHand.forEach(element => {
                kaartenInHand += `<li>${element.cardName}</li>`
            })
            handen += kaartenInHand
        })

        handen += `</ul>`

        var html = `<div>
            <h4>${element.userName}</h4>
            <p>Handen:</p>
            <ul style="list-style: none;">
                ${handen}
            </ul>
        
        </div>`

        playersSection.innerHTML += html
    });
}

function setButtons(options){
    console.log("Setbuttons: ", sessionStorage.getItem('currentUser'), JSON.parse(localStorage.getItem('user')).email)

    var hitbtn = document.getElementById("hitBTN")
    var standbtn = document.getElementById("standBTN")
    var doublebtn = document.getElementById("doubleBTN")
    var splitbtn = document.getElementById("splitBTN")

    if(sessionStorage.getItem('currentUser') !== JSON.parse(localStorage.getItem('user')).email){
        hitbtn.disabled = true
        standbtn.disabled = true
        doublebtn.disabled = true
        splitbtn.disabled = true
    }else{
        if(options != null){
            hitbtn.disabled = true
            standbtn.disabled = true
            doublebtn.disabled = true
            splitbtn.disabled = true 
    
            options.forEach(element => {
                if(element == "stand"){
                    standbtn.disabled = false 
                }
                if(element == "split"){
                    splitbtn.disabled = false
                }
                if(element == "hit"){
                    hitbtn.disabled = false
                }
                if(element == "double"){
                    doublebtn.disabled = false
                }
            });
        }
    }

    
}


document.getElementById("newRoundBTN").addEventListener("click", async () => {
    var btn = document.getElementById("newRoundBTN")
    btn.disabled = true
    if(JSON.parse(localStorage.getItem('user')) == null){
        window.location.replace("/");
        return;
    }

    var gameId = JSON.parse(sessionStorage.getItem('game')).gameId

    console.log(connection.state)

    try {
        if(connection.state == HubConnectionState.Disconnected){
            await startConnection();
        }
        console.log(parseInt(gameId))
        console.log(JSON.parse(sessionStorage.getItem('game')).gameId)
    	await connection.invoke("NewRound", parseInt(gameId));
        btn.hidden = true
        document.getElementById("newRoundBTN").disabled = false
    } catch (err) {
    	console.error(err);
    }
})