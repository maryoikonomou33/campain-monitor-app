document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("email");
    const nameInput = document.getElementById("name");
    const addButton = document.getElementById("add-subscriber");

    console.log("Analytics script loaded!");

    let firstTypeTime = null;

    // Πρώτο type
    emailInput.addEventListener("input", function () {
        if (!firstTypeTime) {
            firstTypeTime = new Date().getTime();
            
        }
    });

    // Για το add
    addButton.addEventListener("click", function () {
        const submitTime = new Date().getTime();
        const timeToSubmit = firstTypeTime ? (submitTime - firstTypeTime) / 1000 : 0;
        console.log("Typing time needed:", timeToSubmit);
        const emailValue = emailInput.value.trim();
        const nameValue = nameInput.value.trim();

        let emailType = categorizeEmail(emailValue); 

        let hasError = false;
        if (!emailValue || !nameValue) {
            hasError = true;
            alert("Please fill in both Name and Email.");
            console.warn("Submission error: Missing input fields");
        }

        gtag("event", "add_subscriber", {
            event_category: "Subscription",
            event_label: "Add Subscriber Button",
            time_to_submit: timeToSubmit,
            email_type: emailType,
            submission_error: hasError
        });

        console.log("Event sent to Google Analytics:", {
            time_to_submit: timeToSubmit,
            email_type: emailType,
            submission_error: hasError
        });

        updateTotalSubscribers(); // Ενημέρωση user property στο GA
   
        firstTypeTime = null; 
    });

    // Για το remove
    document.getElementById("subscriber-list").addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-btn")) {
            console.log("Remove button clicked!");

            const listItem = event.target.closest("li");

            if (!listItem) {
                console.warn("No list item found for deletion!");
                return;
            }

            const emailValue = listItem.getAttribute("data-email");

            if (!emailValue) {
                console.warn("No email found for deleted subscriber!");
                return;
            }

            const subscriberItems = Array.from(document.querySelectorAll("#subscriber-list li"));
            const totalSubscribers = subscriberItems.length;
            const subscriberIndex = subscriberItems.indexOf(listItem) + 1;
            const positionInfo = `${subscriberIndex}/${totalSubscribers}`;
            console.log(`Removed subscriber at position: ${positionInfo}`);

            let emailType = categorizeEmail(emailValue); 

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

            updateTotalSubscribers(); // Ενημέρωση user property στο GA

            
            trackRemoveSubscriber(emailValue, positionInfo);
        }
    });

    // Errors από CM 
    window.trackApiError = function (action, email) {
        const emailType = categorizeEmail(email);
    
        gtag("event", "error_from_cm_api", {
            event_category: "API Errors",
            event_label: action === "add" ? "Add Subscriber Error" : "Remove Subscriber Error",
            email_type: emailType,
            error_message: errorMessage, 
            error_type: "server_error", 
            action_type: action
        });
    
        console.log("Event sent to Google Analytics:", {
            event_category: "API Errors",
            event_label: action === "add" ? "Add Subscriber Error" : "Remove Subscriber Error",
            email_type: emailType,
            error_message: errorMessage, 
            error_type: "server_error",
            action_type: action
        });
    };

    
    window.trackRemoveSubscriber = function (email, positionInfo) {
        let emailType = categorizeEmail(email);

        if (typeof gtag === "function") {
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
        } else {
            console.warn("Google Analytics (gtag) is not loaded yet.");
        }
    };

    // subscribers στο GA
    function updateTotalSubscribers() {
        let totalSubscribers = document.querySelectorAll("#subscriber-list li").length;

        if (typeof gtag === "function") {
            gtag("set", "user_properties", { total_subscribers: totalSubscribers });
            console.log("Updated total_subscribers in GA:", totalSubscribers);
        }
    }

    function categorizeEmail(email) {
        const genericEmailProviders = [
            "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com", "mail.com"
        ];

        const emailDomain = email.split("@")[1] || ""; 

        if (genericEmailProviders.includes(emailDomain)) {
            console.log(`Email ${email} categorized as: Generic`);
            return "generic";
        } else {
            console.log(`Email ${email} categorized as: Personal`);
            return "personal";
        }
    }

    let formFilled = false;
    let formAbandonTimeout;

function trackFormAbandonment() {
    if (!formFilled) return; // αν δεν συθμπληρωθει δεν στέλνει event

    if (typeof gtag === "function") {
        gtag("event", "abandon_form", {
            event_category: "User Behavior",
            event_label: "User Filled Form but Did Not Submit"
        });

        console.log("Event sent to Google Analytics: User abandoned subscription form");
    }

    formFilled = false; // Reset για επόμενη χρήση
}


function checkFormCompletion() {
    const emailValue = emailInput.value.trim();
    const nameValue = nameInput.value.trim();

    if (emailValue !== "" && nameValue !== "") {
        formFilled = true;
        clearTimeout(formAbandonTimeout);
        formAbandonTimeout = setTimeout(trackFormAbandonment, 5000); // 5 δευτερόλεπτα χωρίς "Add"
    } else {
        formFilled = false;
        clearTimeout(formAbandonTimeout);
    }
}


emailInput.addEventListener("input", checkFormCompletion);
nameInput.addEventListener("input", checkFormCompletion);


addButton.addEventListener("click", function () {
    clearTimeout(formAbandonTimeout);
    formFilled = false;
});


});
