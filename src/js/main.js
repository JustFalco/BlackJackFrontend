import '../../style.css'
var url = "https://localhost:7119";

//#region Register and Login Forms
var LoginForm = document.getElementById("LoginForm")

LoginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    Login();
})

async function Login(e) {
    document.getElementById("errors").innerText = ""
    console.log("Loggin in...")

    var Email = document.getElementById("LEmail").value;
    var Password = document.getElementById("LPassword").value;

    if (Email === "" || Password === "") {
        document.getElementById("errors").innerText += "Cannot have empty Email or password!"
        return;
    }

    var data = {
        "Email": Email,
        "Password": Password
    }
    console.log(data)

    var loginUrl = url + "/api/user/login"
    const response = await fetch(loginUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json()).then(async res => {
        if(res.successful){
            localStorage.setItem('user', JSON.stringify(res))
            console.log(JSON.parse(localStorage.getItem('user')).token)
            console.log(res.token)
            window.location.replace("/src/html/game.html");
        }
    })
}

//#endregion

window.onload = () => {

    localStorage.clear();

    if((JSON.parse(localStorage.getItem('user')).token != "") && (localStorage.getItem('user') != undefined)){
        document.getElementById("forms").hidden = true
        startConnection()
    }
}