import '../../style.css'

var url = "https://localhost:7119";

var RegisterForm = document.getElementById("RegisterForm")

RegisterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    Register();
})

async function Register() {
    document.getElementById("errors").innerText = ""
    console.log("Registering...")

    var Email = document.getElementById("REmail").value;
    var Password = document.getElementById("RPassword").value;

    if (Email === "" || Password === "") {
        document.getElementById("errors").innerText += "Cannot have empty Email or password!"
        return;
    }

    var data = {
        "Email": Email,
        "Password": Password
    }
    console.log(data)

    var registerUrl = url + "/api/user/register"
    const response = await fetch(registerUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })


    if (response.status == 200) {
        document.getElementById("forms").hidden = true
        window.location.replace("/");
        
    } else {
        document.getElementById("errors").innerText += response.status + ": " + response.statusText
    }
}