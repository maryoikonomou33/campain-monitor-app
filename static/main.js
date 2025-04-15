$(document).ready(function () {
    function loadSubscribers() {
        $.get('/api/subscribers', function (data) {
            let $list = $("#subscriber-list");
            $list.empty();

            let totalSubscribers = data.subscribers ? data.subscribers.length : 0; // αριθμος subscribers

            if (!data.subscribers || data.subscribers.length === 0) {
                $list.append(`<li class="list-group-item">No subscribers found.</li>`);
            } else {
                data.subscribers.forEach(sub => {
                    addSubscriberToUI(sub.email, sub.name);
                });
            }

            
            if (typeof gtag === "function") {
                gtag("set", "user_properties", {
                    total_subscribers: totalSubscribers
                });
                console.log("User property sent to GA4:", { total_subscribers: totalSubscribers });
            }
        }).fail(function (err) {
            console.error("Error loading subscribers:", err);
        });
    }

    function addSubscriberToUI(email, name) {
        if ($(`li[data-email='${email}']`).length > 0) {
            alert("This subscriber already exists!");
            return;
        }

        let listItem = $(`
            <li class="list-group-item" data-email="${email}">
                ${email} (${name})
                <button class="remove-btn" data-email="${email}">Remove</button>
            </li>
        `);

        listItem.find(".remove-btn").click(function () {
            removeSubscriber(email);
        });

        $("#subscriber-list").append(listItem);
    }

    $("#add-subscriber").click(function () {
        let name = $("#name").val().trim();
        let email = $("#email").val().trim();

        if (!name || !email) {
            alert("Please enter both name and email.");
            return;
        }

        if ($(`li[data-email='${email}']`).length > 0) {
            alert("This subscriber already exists!");
            return;
        }

        // προσωρινο disable στο κουμπί για να αποτραπούν διπλά requests
        $("#add-subscriber").prop("disabled", true);

        $.ajax({
            url: '/api/subscribers',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({ name, email }),
            success: function (response) {
                $("#name").val("");
                $("#email").val("");
                addSubscriberToUI(email, name);
                updateTotalSubscribers(); 
            },
            error: function (err) {
                alert("Failed to add subscriber. Please try again.");

                // τρακ τα λάθη
                trackApiError("add", err.responseText || "Unknown error");
            },
            complete: function () {
                // Επανενεργοποίηση του κουμπιού
                $("#add-subscriber").prop("disabled", false);
            }
        });
    });

    window.removeSubscriber = function (email) {
        if (!confirm(`Are you sure you want to remove ${email}?`)) return;

        let listItem = $(`li[data-email='${email}']`);
        let totalSubscribers = $("#subscriber-list li").length;
        let subscriberIndex = listItem.index() + 1; 
        let positionInfo = `${subscriberIndex}/${totalSubscribers}`;

        $.ajax({
            url: `/api/subscribers?email=${encodeURIComponent(email)}`,
            type: 'DELETE',
            success: function (response) {
                listItem.remove();
                trackRemoveSubscriber(email, positionInfo);
                updateTotalSubscribers(); 
            },
            error: function (err) {
                alert("Failed to remove subscriber. Please try again.");

                
                trackApiError("remove", err.responseText || "Unknown error");
            }
        });
    };

    function updateTotalSubscribers() {
        let totalSubscribers = $("#subscriber-list li").length;

        // σύνολο subscribers στο GA ως user property
        if (typeof gtag === "function") {
            gtag("set", "user_properties", { total_subscribers: totalSubscribers });
            console.log("Updated total_subscribers in GA:", totalSubscribers);
        }
    }

    loadSubscribers();
});
