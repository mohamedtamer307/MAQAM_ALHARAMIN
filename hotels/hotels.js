const hotelsContainer = document.getElementById("hotelsContainer");

loadHotels();

async function loadHotels() {

    hotelsContainer.innerHTML = `
    <div class="col-span-full text-center py-20 text-xl">
        جاري تحميل الفنادق...
    </div>
    `;

    const { data, error } = await supabaseClient
        .from("hotels")
        .select("*")
        .eq("status", true)
        .order("id", { ascending: false });

    if (error) {

        console.error(error);

        hotelsContainer.innerHTML = `
        <div class="col-span-full text-center text-red-600 text-xl py-20">

            حدث خطأ أثناء تحميل الفنادق

        </div>
        `;

        return;

    }

    if (!data || data.length === 0) {

        hotelsContainer.innerHTML = `
        <div class="col-span-full text-center text-gray-600 text-xl py-20">

            لا توجد فنادق حالياً

        </div>
        `;

        return;

    }

    hotelsContainer.innerHTML = "";

    data.forEach(hotel => {

        let stars = "";

        for (let i = 0; i < hotel.stars; i++) {

            stars += "⭐";

        }

        hotelsContainer.innerHTML += `

        <div class="hotel-card">

            <div class="hotel-image">

                <img
                src="${hotel.cover_image}"
                alt="${hotel.name}"
                loading="lazy">

            </div>

            <div class="hotel-body">

                <h2>

                    ${hotel.name}

                </h2>

                <div class="hotel-stars">

                    ${stars}

                </div>

                <p>

                    📍 ${hotel.city}

                </p>

                <p>

                    🚶 ${hotel.distance}

                </p>

                <p class="hotel-price">

                    يبدأ من ${hotel.price_from}

                </p>

                

                <div class="hotel-buttons">

                    <button
                    class="details-btn"
                    onclick="hotelDetails(${hotel.id})">

                        عرض التفاصيل

                    </button>

                    <button
                    class="book-btn"
                    onclick="bookHotel(${hotel.id})">

                        احجز الآن

                    </button>

                </div>

            </div>

        </div>

        `;

    });

}

function hotelDetails(id){

    window.location.href = `hotel.html?id=${id}`;

}

function bookHotel(id){

    window.location.href =
    `../hotels/bookings/index.html?id=${id}`;

}
