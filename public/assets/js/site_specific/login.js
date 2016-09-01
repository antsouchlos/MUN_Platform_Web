//rest the email and password text-boxes
function reset() {
    document.getElementById("email_text").value = "";
    document.getElementById("password_text").value = "";
}

function login() {
    
    //get the email and password
    var email = document.getElementById("email_text").value;
    var password = document.getElementById("password_text").value;
    
    //login to firebase
    const databaseRef = firebase.database();
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        //show wrong_cred message
        document.getElementById("wrong_cred").style.visibility = "visible";
    });
    
    //prevent default form behaviour
    return false;
}

function init() {
    //hide wrong_cred message
    document.getElementById("wrong_cred").style.visibility = "hidden";
    
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser) {
            document.location.href = "staff.html";
        }
    });
}

window.onload = init;