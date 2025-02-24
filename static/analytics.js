document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("email");
    const nameInput = document.getElementById("name");
    const addButton = document.getElementById("add-subscriber");

    console.log("Analytics script loaded!");

    
    let firstTypeTime = null;

    emailInput.addEventListener("input", function () {
        if (!firstTypeTime) {
            firstTypeTime = new Date().getTime();
            console.log("⌨️ First character typed at:", firstTypeTime);
        }
    });

    
    addButton.addEventListener("click", function () {
        const submitTime = new Date().getTime();
        const timeToSubmit = firstTypeTime ? (submitTime - firstTypeTime) / 1000 : 0; 

        const emailValue = emailInput.value.trim();
        const nameValue = nameInput.value.trim();

       
        const genericEmailProviders = [
            "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
            "icloud.com", "aol.com", "mail.com", "zoho.com"
        ];
        const emailDomain = emailValue.split("@")[1] || "";
        const emailType = genericEmailProviders.includes(emailDomain) ? "generic" : "personal";

        let hasError = false;
        if (!emailValue || !nameValue) {
            hasError = true;
            alert("⚠️ Please fill in both Name and Email.");
            console.warn("⚠️ Submission error: Missing input fields");
        }

        
        gtag("event", "add_subscriber", {
            event_category: "Subscription",
            event_label: "Add Subscriber Button",
            time_to_submit: timeToSubmit,
            email_type: emailType,
            submission_error: hasError
        });

        console.log("📊 Event sent to Google Analytics:", {
            time_to_submit: timeToSubmit,
            email_type: emailType,
            submission_error: hasError
        });

        firstTypeTime = null;
    });

    
    document.getElementById("subscriber-list").addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-btn")) {
            console.log("🗑️ Remove button clicked!");

            const listItem = event.target.closest("li");

            if (!listItem) {
                console.warn("⚠️ No list item found for deletion!");
                return;
            }

            const emailValue = listItem.getAttribute("data-email");

            if (!emailValue) {
                console.warn("⚠️ No email found for deleted subscriber!");
                return;
            }

            // Βρίσκουμε τη θέση του subscriber
            const subscriberItems = Array.from(document.querySelectorAll("#subscriber-list li"));
            const totalSubscribers = subscriberItems.length;
            const subscriberIndex = subscriberItems.indexOf(listItem) + 1; 

            const positionInfo = `${subscriberIndex}/${totalSubscribers}`;
            console.log(` Removed subscriber at position: ${positionInfo}`);

            const emailDomain = emailValue.split("@")[1] || "";
            const emailType = genericEmailProviders.includes(emailDomain) ? "generic" : "personal";

           
            gtag("event", "remove_subscriber", {
                event_category: "Subscription",
                event_label: "Remove Subscriber Button",
                removed_position: positionInfo,
                email_type: emailType
            });

            console.log("Event sent to Google Analytics:", {
                removed_position: positionInfo,
                email_type: emailType
            });
        }
    });
});
