const offersContainer =
document.getElementById("offersContainer");

loadOffers();

async function loadOffers() {

const { data, error } = await supabaseClient
.from("offers")
.select("*")
.order("id", { ascending: false });

if (error) {
console.error(error);
return;
}

offersContainer.innerHTML = "";

data.forEach((offer) => {

offersContainer.innerHTML += `

<div class="bg-white rounded-xl overflow-hidden shadow-lg card-hover flex flex-col">

<div class="h-56 md:h-72 lg:h-96 w-full flex items-center justify-center bg-gray-100">

<img
src="${offer.image}"
alt="${offer.title}"
class="max-h-full max-w-full object-contain">

</div>

<div class="p-6 flex flex-col flex-grow">

<h3 class="text-xl font-bold text-teal-700 mb-2">
${offer.title}
</h3>

<p class="text-gray-600 mb-4">
${offer.duration}
</p>

<div class="space-y-2 mb-6 flex-grow">

<p>
🏨 ${offer.hotel}
</p>

<p>
✨ ${offer.services}
</p>

</div>

<div class="flex justify-between items-center mt-auto">

<span class="text-2xl font-bold text-teal-700">
${offer.price}
</span>

<button
onclick="bookPackage(${offer.id})"
class="btn-gold px-6 py-2 rounded-full">
احجز الآن
</button>

</div>

</div>

</div>

`;

});

}

function bookPackage(id){

window.location.href =
`Reservations/booking.html?id=${id}`;

}