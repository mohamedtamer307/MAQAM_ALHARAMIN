// ======================================
// Hotel Bookings Manager
// ======================================

let bookings = [];

const table =
document.getElementById("bookingsTable");

const searchInput =
document.getElementById("searchInput");

const statusFilter =
document.getElementById("statusFilter");

const modal =
document.getElementById("detailsModal");

const detailsContent =
document.getElementById("detailsContent");

const closeModal =
document.getElementById("closeModal");

//======================================
// تحميل الحجوزات
//======================================

loadBookings();

async function loadBookings(){

const {data,error}=await supabaseClient

.from("hotel_bookings")

.select("*")

.order("id",{ascending:false});

if(error){

console.log(error);

alert("حدث خطأ أثناء تحميل الحجوزات");

return;

}

bookings=data || [];

renderBookings();

loadStats();

}

//======================================
// الإحصائيات
//======================================

function loadStats(){

document.getElementById("totalBookings").innerHTML=
bookings.length;

document.getElementById("pendingBookings").innerHTML=

bookings.filter(x=>

x.status==="لم تتم المراجعة"

).length;

document.getElementById("confirmedBookings").innerHTML=

bookings.filter(x=>

x.status==="تم التأكيد"

).length;

document.getElementById("cancelledBookings").innerHTML=

bookings.filter(x=>

x.status==="ملغية"

).length;

}

//======================================
// رسم الجدول
//======================================

function renderBookings(){

table.innerHTML="";

let list=[...bookings];

const keyword=

searchInput.value.toLowerCase();

const status=

statusFilter.value;

if(keyword!=""){

list=list.filter(b=>

(b.full_name||"").toLowerCase().includes(keyword)

||

(b.hotel_name||"").toLowerCase().includes(keyword)

||

(b.phone||"").includes(keyword)

);

}

if(status!=""){

list=list.filter(

b=>b.status===status

);

}

list.forEach(b=>{

table.innerHTML+=`

<tr>

<td>

${b.hotel_name}

</td>

<td>

${b.customer_name}

</td>

<td>

${b.phone}

</td>

<td>

${b.check_in}

</td>

<td>

${b.check_out}

</td>

<td>

${b.rooms}

</td>

<td>

<select

class="status ${statusClass(b.status)}"

onchange="changeStatus(${b.id},this.value)">

<option

${b.status=="لم تتم المراجعة"?"selected":""}>

لم تتم المراجعة

</option>

<option

${b.status=="تم التأكيد"?"selected":""}>

تم التأكيد

</option>

<option

${b.status=="ملغية"?"selected":""}>

ملغية

</option>

</select>

</td>

<td>

<button

class="btn btn-view"

onclick="showBooking(${b.id})">

عرض

</button>

<button

class="btn btn-delete"

onclick="deleteBooking(${b.id})">

حذف

</button>

</td>

</tr>

`;

});

}

//======================================
// تغيير حالة الحجز
//======================================

async function changeStatus(id,status){

const {error}=await supabaseClient

.from("hotel_bookings")

.update({

status:status

})

.eq("id",id);

if(error){

console.log(error);

alert("تعذر تحديث الحالة");

return;

}

const booking=

bookings.find(b=>b.id==id);

if(booking){

booking.status=status;

}

loadStats();

renderBookings();

}

function statusClass(status){

if(status==="تم التأكيد")
return "confirmedStatus";

if(status==="ملغية")
return "cancelledStatus";

return "pendingStatus";

}

//======================================
// عرض التفاصيل
//======================================

function showBooking(id){

const booking=

bookings.find(b=>b.id==id);

if(!booking)
return;

detailsContent.innerHTML=`

<div class="detail-box">

<strong>الفندق</strong>

${booking.hotel_name}

</div>

<div class="detail-box">

<strong>الاسم</strong>

${booking.customer_name}

</div>

<div class="detail-box">

<strong>الجوال</strong>

${booking.phone}

</div>

<div class="detail-box">

<strong>تاريخ الوصول</strong>

${booking.check_in}

</div>

<div class="detail-box">

<strong>تاريخ المغادرة</strong>

${booking.check_out}

</div>

<div class="detail-box">

<strong>عدد الغرف</strong>

${booking.rooms}

</div>

<div class="detail-box">

<strong>عدد البالغين</strong>

${booking.adults}

</div>

<div class="detail-box">

<strong>عدد الأطفال</strong>

${booking.children}

</div>

<div class="detail-box">

<strong>الحالة</strong>

${booking.status}

</div>

<div class="detail-box">

<strong>الملاحظات</strong>

${booking.notes || "-"}

</div>

<div class="detail-box">

<strong>تاريخ الحجز</strong>

${new Date(booking.created_at).toLocaleString("ar-EG")}

</div>

`;

modal.style.display="block";

}

closeModal.onclick=()=>{

modal.style.display="none";

};

window.onclick=(e)=>{

if(e.target==modal)

modal.style.display="none";

};

//======================================
// حذف الحجز
//======================================

async function deleteBooking(id){

if(!confirm("هل تريد حذف الحجز؟"))
return;

const {error}=await supabaseClient

.from("hotel_bookings")

.delete()

.eq("id",id);

if(error){

console.log(error);

alert("تعذر حذف الحجز");

return;

}

bookings=

bookings.filter(

b=>b.id!=id

);

loadStats();

renderBookings();

}

//======================================
// البحث والفلترة
//======================================

searchInput.oninput=()=>{

renderBookings();

};

statusFilter.onchange=()=>{

renderBookings();

};

//======================================
// Excel
//======================================

document

.getElementById("exportExcel")

.onclick=()=>{

const data=

bookings.map(b=>({

"الفندق":b.hotel_name,

"العميل":b.customer_name,

"الجوال":b.phone,

"الوصول":b.check_in,

"المغادرة":b.check_out,

"الغرف":b.rooms,

"البالغين":b.adults,

"الأطفال":b.children,

"الحالة":b.status,

"الملاحظات":b.notes

}));

const ws=

XLSX.utils.json_to_sheet(data);

const wb=

XLSX.utils.book_new();

XLSX.utils.book_append_sheet(

wb,

ws,

"Hotel Bookings"

);

XLSX.writeFile(

wb,

"HotelBookings.xlsx"

);

};

