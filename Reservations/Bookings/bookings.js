let allBookings = [];

async function loginBookings() {

const username =
document.getElementById("username").value;

const password =
document.getElementById("password").value;

const { data, error } =
await supabaseClient
.from("admins")
.select("*")
.eq("username", username)
.eq("password", password)
.eq("role", "bookings")
.single();

if (error || !data) {

alert("بيانات الدخول غير صحيحة");

return;

}

sessionStorage.setItem(
"bookingsLogged",
"true"
);

sessionStorage.setItem(
"fullName",
data.full_name
);

sessionStorage.setItem(
"canDelete",
data.can_delete
);

showBookings();

}

function logoutBookings() {

sessionStorage.removeItem(
"bookingsLogged"
);

location.reload();

}

function showBookings() {

document
.getElementById("loginPage")
.classList.add("hidden");

document
.getElementById("bookingsPage")
.classList.remove("hidden");

document.getElementById("adminName").innerText =
sessionStorage.getItem("fullName");

loadBookings();

}

if (
sessionStorage.getItem("bookingsLogged")
=== "true"
) {

showBookings();

}

async function loadBookings() {

const { data, error } =
await supabaseClient
.from("bookings")
.select("*")
.order("id", { ascending: false });

if (error) {

console.log(error);

return;

}

allBookings = data;

updateStats(data);

renderBookings(data);

}

function renderBookings(data){

const table =
document.getElementById("bookingsTable");

table.innerHTML = "";

data.forEach(booking=>{

const reviewed =
booking.status === "تمت المراجعة";

table.innerHTML += `

<tr class="border-b text-center">

<td class="p-3 whitespace-nowrap">
${booking.package_name || "-"}
</td>

<td class="p-3 whitespace-nowrap">
${booking.trip_date || "-"}
</td>

<td class="p-3 whitespace-nowrap">
${booking.room_type || "-"}
</td>

<td class="p-3 whitespace-nowrap">
${booking.city_name || "-"}
</td>

<td class="p-3 whitespace-nowrap">
${booking.full_name || "-"}
</td>

<td class="p-3 whitespace-nowrap">
${booking.phone || "-"}
</td>

<td class="p-3 whitespace-nowrap">
${booking.passengers || "-"}
</td>

<td class="p-3 font-bold text-green-700">
${booking.total_price || 0} ريال
</td>

<td class="p-3 whitespace-nowrap">

<span class="
px-3 py-1 rounded text-white
${reviewed ? "bg-green-500" : "bg-red-500"}
">

${reviewed ? "تمت المراجعة" : "لم تتم المراجعة"}

</span>

</td>

<td class="p-3 whitespace-nowrap">

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

${
reviewed
? `تمت المراجعة بواسطة<br>${booking.reviewed_by || ""}`
: "لم تتم المراجعة"
}

</button>

${
sessionStorage.getItem("canDelete") === "true"
?
`
<button
onclick="deleteBooking(${booking.id})"
class="bg-red-500 text-white px-3 py-1 rounded">
حذف
</button>
`
:
""
}

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

async function openWhatsapp(id, phone){

await supabaseClient
.from("bookings")
.update({
status: "تمت المراجعة",
reviewed_by: sessionStorage.getItem("fullName")
})
.eq("id", id);

// حذف المسافات والرموز
phone = String(phone)
.replace(/\s/g, "")
.replace("+", "");

// فتح واتساب بالرقم كما هو محفوظ
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

document.getElementById("searchName")
.addEventListener("input", filterBookings);

document.getElementById("searchPhone")
.addEventListener("input", filterBookings);

document.getElementById("statusFilter")
.addEventListener("change", filterBookings);

document.getElementById("tripDateFilter")
.addEventListener("change", filterBookings);

document.getElementById("bookingDateFilter")
.addEventListener("change", filterBookings);

function filterBookings() {

const searchName =
document.getElementById("searchName")
.value
.toLowerCase();

const searchPhone =
document.getElementById("searchPhone")
.value;

const status =
document.getElementById("statusFilter")
.value;

const tripDate =
document.getElementById("tripDateFilter")
.value;

const bookingDate =
document.getElementById("bookingDateFilter")
.value;

const filtered = allBookings.filter(booking => {

const matchName =
(booking.full_name || "")
.toLowerCase()
.includes(searchName);

const matchPhone =
String(booking.phone || "")
.includes(searchPhone);

const matchStatus =
status === "" ||
booking.status === status;

const matchTripDate =
tripDate === "" ||
booking.trip_date === tripDate;

let matchBookingDate = true;

if (bookingDate !== "") {

const createdDate =
new Date(booking.created_at)
.toISOString()
.split("T")[0];

matchBookingDate =
createdDate === bookingDate;

}

return (
matchName &&
matchPhone &&
matchStatus &&
matchTripDate &&
matchBookingDate
);

});

renderBookings(filtered);

}


function exportToExcel() {

    const data = allBookings.map(booking => ({

        "الباقة": booking.package_name || "",

        "موعد الرحلة": booking.trip_date || "",

        "نوع الحجز": booking.room_type || "",

        "المدينة": booking.city_name || "",

        "الاسم": booking.full_name || "",

        "الجوال": booking.phone || "",

        "عدد الأفراد": booking.passengers || "",

        "الإجمالي": booking.total_price || 0,

        "الحالة": booking.status || "",

        "تاريخ الحجز":
        booking.created_at
        ?
        new Date(booking.created_at)
        .toLocaleString("ar-SA")
        :
        "",

        "تمت المراجعة بواسطة":
        booking.reviewed_by || ""

    }));


    const worksheet =
    XLSX.utils.json_to_sheet(data);

    const workbook =
    XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "الحجوزات"
    );

    XLSX.writeFile(
        workbook,
        "bookings.xlsx"
    );

}



window.loginBookings = loginBookings;

window.logoutBookings = logoutBookings;

window.deleteBooking = deleteBooking;

window.openWhatsapp = openWhatsapp;

// ======================
// التحديث التلقائي للحجوزات
// ======================

supabaseClient
.channel("bookings-channel")
.on(
"postgres_changes",
{
event: "*",
schema: "public",
table: "bookings"
},
(payload) => {

console.log("تم تحديث الحجوزات", payload);

// إعادة تحميل الجدول والإحصائيات
loadBookings();

}
)
.subscribe();
