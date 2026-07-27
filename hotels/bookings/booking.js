// ======================================
// Hotel Booking
// ======================================

const params = new URLSearchParams(window.location.search);

const hotelId = params.get("id");

let hotel = null;

if (!hotelId) {

    alert("لم يتم اختيار الفندق");

    window.location.href = "../../hotels/index.html";

}

// ======================================
// تحميل الفندق
// ======================================

loadHotel();

async function loadHotel() {

    const { data, error } = await supabaseClient

        .from("hotels")

        .select("*")

        .eq("id", hotelId)

        .single();

    if (error || !data) {

        console.log(error);

        alert("تعذر تحميل الفندق");

        return;

    }

    hotel = data;

    renderHotel();

}

// ======================================
// عرض الفندق
// ======================================

function renderHotel() {

    let stars = "";

    for (let i = 0; i < hotel.stars; i++) {

        stars += "⭐";

    }

    document.getElementById("hotelInfo").innerHTML = `

<div class="bg-white">

<img
src="${hotel.cover_image}"
class="w-full h-72 object-contain bg-gray-100">

<div class="p-6">

<h1 class="text-3xl font-bold text-[#0A2342]">

${hotel.name}

</h1>

<div class="mt-3 text-xl">

${"⭐".repeat(hotel.stars)}

</div>

<div class="grid md:grid-cols-3 gap-4 mt-6 text-gray-700">

<div>📍 المدينة: ${hotel.city}</div>

<div>🚶 المسافة: ${hotel.distance}</div>

<div class="font-bold text-[#C9A44C]">
💰 يبدأ من ${hotel.price_from}
</div>

</div>

<p class="mt-6 leading-8 text-gray-600">

${hotel.short_description || hotel.description}

</p>

</div>

</div>

`;

}

// ======================================
// رقم الهاتف
// ======================================

const phoneInput = document.querySelector("#phone");

let iti;

if (window.intlTelInput) {

    iti = window.intlTelInput(phoneInput, {

        initialCountry: "sa",

        preferredCountries: [
            "sa",
            "eg",
            "ae",
            "kw",
            "qa"
        ],

        separateDialCode: true,

        nationalMode: true,

        autoPlaceholder: "aggressive",

        utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.0/build/js/utils.js"

    });

}


// ======================================
// حفظ الحجز
// ======================================

document

.getElementById("bookingForm")

.addEventListener(

"submit",

async (e)=>{

e.preventDefault();

const fullName =
document.getElementById("fullName").value.trim();

let phone =
document.getElementById("phone").value.trim();

const checkIn =
document.getElementById("checkIn").value;

const checkOut =
document.getElementById("checkOut").value;

const rooms =
Number(document.getElementById("rooms").value);

const adults =
Number(document.getElementById("adults").value);

const children =
Number(document.getElementById("children").value);

const notes =
document.getElementById("notes").value.trim();

if(fullName==""){

alert("يرجى إدخال الاسم");

return;

}

if(phone==""){

alert("يرجى إدخال رقم الجوال");

return;

}

const country =
iti.getSelectedCountryData();

phone = phone.replace(/\D/g,"");

if(phone.startsWith("0")){

phone = phone.substring(1);

}

const fullPhone =
"+" + country.dialCode + phone;

const {error} =
await supabaseClient

.from("hotel_bookings")

.insert([{

hotel_id:hotel.id,

hotel_name:hotel.name,

city:hotel.city,

customer_name:fullName,

phone:fullPhone,

check_in:checkIn,

check_out:checkOut,

rooms:rooms,

adults:adults,

children:children,

notes:notes,

status:"لم تتم المراجعة"

}]);

if(error){

console.log(error);

alert("حدث خطأ أثناء إرسال الحجز");

return;

}

// ======================================
// إرسال رسالة واتساب
// ======================================

const message = `🏨 طلب حجز فندق جديد

🏨 الفندق:
${hotel.name}

📍 المدينة:
${hotel.city}

📅 الوصول:
${checkIn}

📅 المغادرة:
${checkOut}

🛏 عدد الغرف:
${rooms}

👨 عدد البالغين:
${adults}

👶 عدد الأطفال:
${children}

👤 الاسم:
${fullName}

📱 الجوال:
${fullPhone}

📝 الملاحظات:
${notes || "لا توجد"}
`;

window.open(

`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,

"_blank"

);

// ======================================
// رسالة نجاح
// ======================================

alert("تم إرسال طلب الحجز بنجاح");

// ======================================
// إعادة ضبط النموذج
// ======================================

document.getElementById("bookingForm").reset();

document.getElementById("rooms").value = 1;

document.getElementById("adults").value = 1;

document.getElementById("children").value = 0;

});