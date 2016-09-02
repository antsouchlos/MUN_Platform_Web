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
        if(firebaseUser.email == "an.tsouchlos@gmail.com") {
            document.location.href = "staff.html";
        } else if (firebaseUser.email == "dimpeppas@hotmail.gr"){
            document.location.href = "staff.html";
        }
        
        var email = firebaseUser.email;
        
        if (email == "political@dsamun.com") {
            currentCommittee = "political";
            document.location.href = "chair.html";
        } else if (email == "disarmament@dsamun.com") {
            currentCommittee = "disarmament";
            document.location.href = "chair.html";
        } else if (email == "humanitarian@dsamun.com") {
            currentCommittee = "humanitarian";
            document.location.href = "chair.html";
        } else if (email == "environmental@dsamun.com") {
            currentCommittee = "environmental";
            document.location.href = "chair.html";
        } else if (email == "staff@dsamun.com") {
            document.location.href = "staff.html";
        }
    });
}

window.onload = init;