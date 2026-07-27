// ======================================
// Hotels Manager
// ======================================

let hotels = [];

let editingHotelId = null;

let coverFile = null;

let galleryFiles = [];

const table =
document.getElementById("hotelsTable");

const editor =
document.getElementById("editor");

const saveBtn =
document.getElementById("saveHotel");

const addBtn =
document.getElementById("addHotelBtn");

const closeBtn =
document.getElementById("closeEditor");

const servicesContainer =
document.getElementById("servicesContainer");

const coverInput =
document.getElementById("coverImage");

const galleryInput =
document.getElementById("hotelImages");

const coverPreview =
document.getElementById("coverPreview");

const imagesPreview =
document.getElementById("imagesPreview");

addBtn.onclick=openEditor;

closeBtn.onclick=closeEditor;

saveBtn.onclick=saveHotel;

loadHotels();

async function loadHotels(){

const {data,error}=await supabaseClient

.from("hotels")

.select("*")

.order("id",{ascending:false});

if(error){

console.log(error);

return;

}

hotels=data;

renderHotels();

}

function renderHotels(){

table.innerHTML="";

hotels.forEach(h=>{

table.innerHTML+=`

<tr>

<td>

<img

src="${h.cover_image}"

style="width:80px;height:70px;object-fit:cover;border-radius:10px;">

</td>

<td>

${h.name}

</td>

<td>

${h.city}

</td>

<td>

${"⭐".repeat(h.stars)}

</td>

<td>

${h.price_from}

</td>

<td>

${h.status ? "ظاهر":"مخفي"}

</td>

<td>

<button

class="btn btn-primary"

onclick="editHotel(${h.id})">

تعديل

</button>

<button

class="btn btn-danger"

onclick="deleteHotel(${h.id})">

حذف

</button>

</td>

</tr>

`;

});

}

function openEditor(){

editingHotelId=null;

editor.style.display="flex";

document.getElementById("editorTitle").innerHTML="إضافة فندق";

document.querySelectorAll("input").forEach(x=>{

if(x.type!="file")

x.value="";

});

document.querySelectorAll("textarea").forEach(x=>{

x.value="";

});

coverPreview.innerHTML="";

imagesPreview.innerHTML="";

servicesContainer.innerHTML="";

coverFile=null;

galleryFiles=[];

addService();

}

function closeEditor(){

editor.style.display="none";

}

function addService(value=""){

servicesContainer.innerHTML+=`

<div style="display:flex;gap:10px;margin-bottom:10px;">

<input

class="serviceInput"

value="${value}"

placeholder="اسم الخدمة">

<button

class="btn btn-danger"

onclick="this.parentElement.remove()">

×

</button>

</div>

`;

}

document.getElementById("addService").onclick=()=>{

addService();

};

coverInput.onchange=e=>{

coverFile=e.target.files[0];

coverPreview.innerHTML="";

const img=document.createElement("img");

img.src=URL.createObjectURL(coverFile);

coverPreview.appendChild(img);

};

galleryInput.onchange=e=>{

galleryFiles=[...e.target.files];

imagesPreview.innerHTML="";

galleryFiles.forEach(file=>{

const img=document.createElement("img");

img.src=URL.createObjectURL(file);

imagesPreview.appendChild(img);

});

};

async function uploadCover() {

    if (!coverFile) return "";

   const ext = coverFile.name.split(".").pop().toLowerCase();

const fileName = `cover_${crypto.randomUUID()}.${ext}`;

    const { error } = await supabaseClient.storage
        .from("hotels")
        .upload(fileName, coverFile);

    if (error) {
    console.log(error);
    alert(error.message);
    return "";
}

    const { data } = supabaseClient.storage
        .from("hotels")
        .getPublicUrl(fileName);

    return data.publicUrl;

}

async function uploadGallery(hotelId){

    if(galleryFiles.length==0)
        return;

    for(const file of galleryFiles){

       const ext = file.name.split(".").pop().toLowerCase();

const fileName =
`gallery_${hotelId}_${crypto.randomUUID()}.${ext}`;

        const {error}=await supabaseClient.storage

        .from("hotels")

        .upload(fileName,file);

        if(error){
    console.log(error);
    alert(error.message);
    continue;
}

        const {data}=supabaseClient.storage

        .from("hotels")

        .getPublicUrl(fileName);

        await supabaseClient

        .from("hotel_images")

        .insert({

            hotel_id:hotelId,

            image_url:data.publicUrl

        });

    }

}

async function saveServices(hotelId){

    await supabaseClient

    .from("hotel_services")

    .delete()

    .eq("hotel_id",hotelId);

    const services=[];

    document

    .querySelectorAll(".serviceInput")

    .forEach(input=>{

        if(input.value.trim()!=""){

            services.push({

                hotel_id:hotelId,

                service_name:input.value

            });

        }

    });

    if(services.length){

        await supabaseClient

        .from("hotel_services")

        .insert(services);

    }

}

async function saveHotel() {

    const hotel = {

        name: document.getElementById("hotelName").value.trim(),

        city: document.getElementById("hotelCity").value.trim(),

        distance: document.getElementById("hotelDistance").value.trim(),

        price_from: document.getElementById("hotelPrice").value.trim(),

        stars: Number(document.getElementById("hotelStars").value),

        short_description: document.getElementById("hotelShort").value.trim(),

        description: document.getElementById("hotelDescription").value.trim(),

        google_map: document.getElementById("hotelMap").value.trim(),

        status: true

    };

    if (
        hotel.name === "" ||
        hotel.city === ""
    ) {

        alert("يرجى إدخال اسم الفندق والمدينة");

        return;

    }

    saveBtn.disabled = true;

    saveBtn.innerHTML = "جاري الحفظ...";

   // رفع صورة الغلاف عند اختيار صورة جديدة فقط
if (coverFile) {
    hotel.cover_image = await uploadCover();
}

// متغيرات الحفظ
let data;
let error;

// إذا كنا نعدل الفندق
if (editingHotelId) {

    const result = await supabaseClient
        .from("hotels")
        .update(hotel)
        .eq("id", editingHotelId)
        .select()
        .single();

    data = result.data;
    error = result.error;

} else {

    // إضافة فندق جديد
    hotel.cover_image = await uploadCover();

    const result = await supabaseClient
        .from("hotels")
        .insert(hotel)
        .select()
        .single();

    data = result.data;
    error = result.error;

}

    if (error) {

        console.log(error);

        alert("حدث خطأ أثناء حفظ الفندق");

        saveBtn.disabled = false;

        saveBtn.innerHTML = "💾 حفظ الفندق";

        return;

    }

    await saveServices(data.id);

// ارفع صور المعرض فقط إذا تم اختيار صور جديدة
if (galleryFiles.length > 0) {
    await uploadGallery(data.id);
}

alert(editingHotelId ? "تم تعديل الفندق بنجاح" : "تم إضافة الفندق بنجاح");

editingHotelId = null;

    closeEditor();

    loadHotels();

    saveBtn.disabled = false;

    saveBtn.innerHTML = "💾 حفظ الفندق";

}

// ======================================
// Edit Hotel
// ======================================

function editHotel(id){

    const hotel = hotels.find(h => h.id == id);

    if(!hotel) return;

    editingHotelId = id;

    editor.style.display = "flex";

    document.getElementById("editorTitle").innerHTML = "تعديل الفندق";

    document.getElementById("hotelName").value = hotel.name;
    document.getElementById("hotelCity").value = hotel.city;
    document.getElementById("hotelStars").value = hotel.stars;
    document.getElementById("hotelDistance").value = hotel.distance;
    document.getElementById("hotelPrice").value = hotel.price_from;
    document.getElementById("description").value = hotel.description;
    document.getElementById("status").checked = hotel.status;

    coverPreview.innerHTML = "";

    if(hotel.cover_image){

        coverPreview.innerHTML = `
        <img src="${hotel.cover_image}">
        `;

    }

    servicesContainer.innerHTML = "";

    if(hotel.services){

        hotel.services.forEach(service=>{

            addService(service);

        });

    }

}

// ======================================
// Delete Hotel
// ======================================

async function deleteHotel(id){

    if(!confirm("هل تريد حذف الفندق؟"))
        return;

    const {error} = await supabaseClient

        .from("hotels")

        .delete()

        .eq("id",id);

    if(error){

        console.log(error);

        alert("حدث خطأ");

        return;

    }

    loadHotels();

}