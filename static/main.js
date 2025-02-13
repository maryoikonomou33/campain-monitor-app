$(document).ready(function() {
    function loadSubscribers() {
        $.get('/api/subscribers', function(data) {
            let $list = $("#subscriber-list");
            $list.empty();

            if (!data.subscribers || data.subscribers.length === 0) {
                $list.append(`<li class="list-group-item">No subscribers found.</li>`);
                return;
            }

            data.subscribers.forEach(sub => {
                addSubscriberToUI(sub.email, sub.name);
            });
        }).fail(function(err) {
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
                <button class="remove-btn">Remove</button>
            </li>
        `);

        listItem.find(".remove-btn").click(function() {
            removeSubscriber(email);
        });

        $("#subscriber-list").append(listItem);
    }

    $("#add-subscriber").click(function() {
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

        $.ajax({
            url: '/api/subscribers',
            type: 'POST',
            contentType: "application/json",
            data: JSON.stringify({ name, email }),
            success: function(response) {
                $("#name").val("");  
                $("#email").val("");
                addSubscriberToUI(email, name);
            },
            error: function(err) {
                alert("Failed to add subscriber. Please try again.");
            }
        });
    });

    window.removeSubscriber = function(email) {
        if (!confirm(`Are you sure you want to remove ${email}?`)) return;

        $.ajax({
            url: `/api/subscribers?email=${encodeURIComponent(email)}`,
            type: 'DELETE',
            success: function(response) {
                $(`li[data-email='${email}']`).remove();
            },
            error: function(err) {
                alert("Failed to remove subscriber. Please try again.");
            }
        });
    };

    loadSubscribers();
});
