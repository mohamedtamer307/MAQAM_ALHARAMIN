document
.getElementById("loginForm")
.addEventListener("submit", async (e)=>{

e.preventDefault();

const username =
document.getElementById("username").value;

const password =
document.getElementById("password").value;

const { data , error } = await supabase
.from("admins")
.select("*")
.eq("username", username)
.eq("password", password)
.single();

if(error){

alert("بيانات الدخول غير صحيحة");

return;

}

localStorage.setItem(
"adminLoggedIn",
"true"
);

localStorage.setItem(
"adminUsername",
username
);

window.location.href="dashboard.html";

});
