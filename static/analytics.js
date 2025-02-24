document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("email");
    const nameInput = document.getElementById("name");
    const addButton = document.getElementById("add-subscriber");

    let firstTypeTime = null;

    
    emailInput.addEventListener("input", function () {
        if (!firstTypeTime) {
            firstTypeTime = new Date().getTime();
        }
    });

    
    addButton.addEventListener("click", function () {
        const submitTime = new Date().getTime();
        const timeToSubmit = firstTypeTime ? (submitTime - firstTypeTime) / 1000 : 0;

        const emailValue = emailInput.value.trim();
        const nameValue = nameInput.value.trim();

       
        const genericEmailProviders = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com", "mail.com", "zoho.com"];
        const emailDomain = emailValue.split("@")[1] || "";
        const emailType = genericEmailProviders.includes(emailDomain) ? "generic" : "personal";

       
        let hasError = false;
        if (!emailValue || !nameValue) {
            hasError = true;
            alert("Please fill in both Name and Email.");
        }

        
        gtag("event", "add_subscriber", {
            event_category: "Subscription",
            event_label: "Add Subscriber Button",
            time_to_submit: timeToSubmit,
            email_type: emailType,
            submission_error: hasError
        });

        console.log("Event sent to Google Analytics", {
            time_to_submit: timeToSubmit,
            email_type: emailType,
            submission_error: hasError
        });

       
        firstTypeTime = null;
    });
});
