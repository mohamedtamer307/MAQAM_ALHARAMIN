const params=new URLSearchParams(window.location.search);

const id=params.get("id");

const container=document.getElementById("hotelContainer");

loadHotel();

async function loadHotel(){

const {data:hotel}=await supabaseClient

.from("hotels")

.select("*")

.eq("id",id)

.single();

const {data:images}=await supabaseClient

.from("hotel_images")

.select("*")

.eq("hotel_id",id)

.order("sort_order");

const {data:services}=await supabaseClient

.from("hotel_services")

.select("*")

.eq("hotel_id",id);

let gallery="";

images.forEach(img=>{

gallery+=`

<img

src="${img.image_url}"

class="gallery-image"

onclick="changeImage('${img.image_url}')"

>

`;

});

let serviceHTML="";

services.forEach(s=>{

serviceHTML+=`

<div class="service">

✔ ${s.service_name}

</div>

`;

});

container.innerHTML=`

<div class="hotel-page">

<div class="left">

<img

id="mainImage"

src="${images[0].image_url}"

class="main-image">

<div class="gallery">

${gallery}

</div>

</div>

<div class="right">

<h1>

${hotel.name}

</h1>

<div class="stars">

${"⭐".repeat(hotel.stars)}

</div>

<p>

📍 ${hotel.city}

</p>

<p>

🚶 ${hotel.distance}

</p>

<h2>

 يبدأ من ${hotel.price_from} ريال

</h2>

<p>

${hotel.description}

</p>

<h3>

الخدمات

</h3>

<div class="services">

${serviceHTML}

</div>

<button

class="bookNow"

onclick="location.href='../hotels/bookings/index.html?id=${id}'">

احجز الآن

</button>

</div>

</div>

`;

}

function changeImage(src){

document.getElementById("mainImage").src=src;

}
