const params = new URLSearchParams(window.location.search);
const offerId = params.get("id");

let selectedOffer = null;

if (!offerId) {

  alert("لم يتم اختيار باقة");
  window.location.href = "../index.html";

}

loadOffer();

async function loadOffer() {

  const { data, error } = await supabaseClient
    .from("offers")
    .select("*")
    .eq("id", offerId)
    .single();

  if (error || !data) {

    alert("تعذر تحميل الباقة");
    console.log(error);
    return;

  }

  selectedOffer = data;

  document.getElementById("packageInfo").innerHTML = `

    <div class="border rounded-2xl p-5 bg-gray-50">

      <h2 class="text-2xl font-bold text-[#0A2342] mb-3">
        ${data.title}
      </h2>

      <p class="text-gray-600 mb-4">
        ${data.description || ""}
      </p>

      <div class="text-green-700 space-y-1">

        ${data.feature1 ? `<div>✅ ${data.feature1}</div>` : ""}
        ${data.feature2 ? `<div>✅ ${data.feature2}</div>` : ""}
        ${data.feature3 ? `<div>✅ ${data.feature3}</div>` : ""}
        ${data.feature4 ? `<div>✅ ${data.feature4}</div>` : ""}
        ${data.feature5 ? `<div>✅ ${data.feature5}</div>` : ""}

      </div>

    </div>

  `;

  loadTrips();

}

function loadTrips() {

  const tripSelect =
    document.getElementById("tripDate");

  tripSelect.innerHTML =
    `<option value="">اختر موعد الرحلة</option>`;

  [
    selectedOffer.trip1,
    selectedOffer.trip2,
    selectedOffer.trip3,
    selectedOffer.trip4

  ].forEach(trip => {

    if (trip && trip.trim() !== "") {

      tripSelect.innerHTML += `
        <option value="${trip}">
          ${trip}
        </option>
      `;

    }

  });

}

/* ===========================
   التحكم في عدد الأفراد
=========================== */

function togglePassengers(){

const roomType =
document.getElementById("roomType").value;

const passengersInput =
document.getElementById("passengers");

if(
roomType === "رباعية خاصة" ||
roomType === "ثلاثية خاصة" ||
roomType === "ثنائية خاصة" ||
roomType === "خاصة"
){

passengersInput.value = 1;

passengersInput.readOnly = true;

passengersInput.classList.add(
"bg-gray-100",
"cursor-not-allowed"
);

}
else{

passengersInput.readOnly = false;

passengersInput.classList.remove(
"bg-gray-100",
"cursor-not-allowed"
);

}

}

/* ===========================
   حساب السعر
=========================== */

function calculatePrice(){

if(!selectedOffer){
return 0;
}

const roomType =
document.getElementById("roomType").value;

const passengers =
parseInt(
document.getElementById("passengers").value
) || 1;

let total = 0;

if(roomType === "خماسية مشتركة"){

total =
passengers *
Number(selectedOffer.five_price || 0);

}

else if(roomType === "رباعية خاصة"){

total =
Number(selectedOffer.four_price || 0);

}

else if(roomType === "ثلاثية خاصة"){

total =
Number(selectedOffer.three_price || 0);

}

else if(roomType === "ثنائية خاصة"){

total =
Number(selectedOffer.two_price || 0);

}

else if(roomType === "خاصة"){

total =
Number(selectedOffer.single_price || 0);

}

else if(roomType === "مواصلات ذهاب فقط"){

total =
passengers *
Number(selectedOffer.transport_one_way || 0);

}

else if(roomType === "مواصلات ذهاب وعودة"){

total =
passengers *
Number(selectedOffer.transport_round_trip || 0);

}

document.getElementById(
"totalPrice"
).innerHTML =
`الإجمالي: ${total} ريال`;

return total;

}

/* ===========================
   أحداث الصفحة
=========================== */

document
.getElementById("roomType")
.addEventListener(
"change",
()=>{

togglePassengers();
calculatePrice();

}
);

document
.getElementById("passengers")
.addEventListener(
"input",
calculatePrice
);

/* ===========================
   إرسال الحجز
=========================== */

document
.getElementById("bookingForm")
.addEventListener(
"submit",
async (e) => {

e.preventDefault();

const fullName =
document.getElementById(
"fullName"
).value;

const phone =
document.getElementById("phone").value;

const tripDate =
document.getElementById(
"tripDate"
).value;

const roomType =
document.getElementById(
"roomType"
).value;

const passengers =
parseInt(
document.getElementById(
"passengers"
).value
);

const notes =
document.getElementById(
"notes"
).value;

// =====================
// التحقق من الحقول
// =====================

if(fullName === ""){

alert("يرجى إدخال الاسم الثلاثي");
return;

}

if(phone === ""){

alert("يرجى إدخال رقم الجوال");
return;

}

if(tripDate === ""){

alert("يرجى اختيار موعد الرحلة");
return;

}

if(roomType === ""){

alert("يرجى اختيار نوع الحجز");
return;

}

if(passengers <= 0){

alert("يرجى إدخال عدد الأفراد");
return;

}

const total =
calculatePrice();

const { error } =
await supabaseClient
.from("bookings")
.insert([
{

offer_id:
offerId,

package_name:
selectedOffer.title,

trip_date:
tripDate,

room_type:
roomType,

passengers:
passengers,

total_price:
total,

full_name:
fullName,

phone:
phone,

notes:
notes,

status:
"لم تتم المراجعة"

}
]);

if(error){

alert("فشل الحجز");

console.log(error);

return;

}

const message = `🌙 طلب حجز جديد

🎁 الباقة:
${selectedOffer.title}

🚌 موعد الرحلة:
${tripDate}

🛏 نوع الحجز:
${roomType}

👥 عدد الأفراد:
${passengers}

💰 الإجمالي:
${total} ريال

👤 الاسم:
${fullName}

📱 الجوال:
${phone}

📝 الملاحظات:
${notes || "لا توجد"}

📌 تكلفة تمديد الليلة بدون العودة:
140 ريال

📌 تكلفة تمديد الليلة مع العودة:
160 ريال`;

window.open(
`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
"_blank"
);

alert("تم إرسال الحجز بنجاح");

document
.getElementById(
"bookingForm"
)
.reset();

document
.getElementById(
"totalPrice"
)
.innerHTML =
"الإجمالي: 0 ريال";

}
);

const phoneInput = document.querySelector("#phone");

const iti = window.intlTelInput(phoneInput, {

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
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.2.1/js/utils.js"

});
