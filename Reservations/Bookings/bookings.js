async function loginBookings(){

const username =
document.getElementById("username").value;

const password =
document.getElementById("password").value;

const { data, error } =
await supabaseClient
.from("admins")
.select("*")
.eq("username",username)
.eq("password",password)
.eq("role","bookings")
.single();

if(error || !data){

alert("بيانات الدخول غير صحيحة");

return;

}

sessionStorage.setItem(
"bookingsLogged",
"true"
);

showBookings();

}



function logoutBookings(){

sessionStorage.removeItem(
"bookingsLogged"
);

location.reload();

}



function showBookings(){

document
.getElementById("loginPage")
.classList.add("hidden");

document
.getElementById("bookingsPage")
.classList.remove("hidden");

loadBookings();

}



if(
sessionStorage.getItem("bookingsLogged")
==="true"
){

showBookings();

}



async function loadBookings(){

const { data, error } =
await supabaseClient
.from("bookings")
.select("*")
.order("id",{ascending:false});

if(error){

console.log(error);
return;

}

const table =
document.getElementById("bookingsTable");

table.innerHTML = "";
updateStats(data);
data.forEach(booking=>{

const reviewed =
booking.status === "تمت المراجعة";

table.innerHTML += `

<tr class="border-b text-center">

<td class="p-3">
${booking.package_name || "-"}
</td>

<td class="p-3">
${booking.trip_date || "-"}
</td>

<td class="p-3">
${booking.room_type || "-"}
</td>

<td class="p-3">
${booking.full_name || "-"}
</td>

<td class="p-3">
${booking.phone || "-"}
</td>

<td class="p-3">
${booking.passengers || "-"}
</td>

<td class="p-3 font-bold text-green-700">
${booking.total_price || 0} ريال
</td>

<td class="p-3">

<span class="
px-3 py-1 rounded text-white
${reviewed ? "bg-green-500" : "bg-red-500"}
">

${reviewed ? "تمت المراجعة" : "لم تتم المراجعة"}

</span>

</td>

<td class="p-3">

${
booking.created_at
?
new Date(
booking.created_at
).toLocaleString("ar-SA")
:
"-"
}

</td>

<td class="p-3 flex gap-2 justify-center">

<button
onclick="openWhatsapp(${booking.id},'${booking.phone}')"
class="
px-3 py-1 rounded text-white
${reviewed ? "bg-green-600" : "bg-red-600"}
">

${reviewed ? "تمت المراجعة" : "لم تتم المراجعة"}

</button>

<button
onclick="deleteBooking(${booking.id})"
class="bg-red-500 text-white px-3 py-1 rounded">

حذف

</button>

</td>

</tr>

`;

});

}

function updateStats(data){

document.getElementById(
"totalBookings"
).innerText = data.length;

document.getElementById(
"reviewedBookings"
).innerText =
data.filter(
x=>x.status==="تمت المراجعة"
).length;

document.getElementById(
"pendingBookings"
).innerText =
data.filter(
x=>x.status!=="تمت المراجعة"
).length;

let revenue = 0;

data.forEach(x=>{

revenue +=
Number(x.total_price || 0);

});

document.getElementById(
"totalRevenue"
).innerText =
revenue + " ريال";

}

async function openWhatsapp(id,phone){

await supabaseClient
.from("bookings")
.update({
status:"تمت المراجعة"
})
.eq("id",id);

window.open(
`https://wa.me/${phone}`,
"_blank"
);

loadBookings();

}



async function deleteBooking(id){

if(!confirm("هل تريد حذف الحجز؟"))
return;

const { error } =
await supabaseClient
.from("bookings")
.delete()
.eq("id",id);

if(error){

alert("فشل حذف الحجز");

console.log(error);

return;

}

loadBookings();

}



window.loginBookings = loginBookings;

window.logoutBookings = logoutBookings;

window.deleteBooking = deleteBooking;

window.openWhatsapp = openWhatsapp;

