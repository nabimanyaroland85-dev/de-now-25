/* =========================================================
   DE NOW APP - COMPLETE JAVASCRIPT
   CUSTOMER + PROVIDER + REQUESTS + NOTIFICATIONS
   CHAT + TRACKING + RATINGS
   ========================================================= */

console.log("De Now App is running!");


/* =========================================================
   SAFE STORAGE
   ========================================================= */

let memoryStorage = {};

function storageGet(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return Object.prototype.hasOwnProperty.call(memoryStorage, key)
            ? memoryStorage[key]
            : null;
    }
}

function storageSet(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        memoryStorage[key] = value;
    }
}

function storageRemove(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        delete memoryStorage[key];
    }
}


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let deNowUserData = null;


/* =========================================================
   USERS
   ========================================================= */

function getUsers() {
    try {
        const data = storageGet("deNowUsers");
        return data ? JSON.parse(data) : [];
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    storageSet("deNowUsers", JSON.stringify(users));
}

function saveUser(user) {

    const users = getUsers();

    const existingIndex = users.findIndex(
        item =>
            item.email &&
            user.email &&
            item.email.toLowerCase() === user.email.toLowerCase()
    );

    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }

    saveUsers(users);

    storageSet(
        "deNowCurrentUser",
        JSON.stringify(user)
    );

    deNowUserData = user;
}

function getCurrentUser() {

    try {

        const data =
            storageGet("deNowCurrentUser");

        return data
            ? JSON.parse(data)
            : null;

    } catch (error) {

        return null;
    }
}


/* =========================================================
   SIGN UP
   ========================================================= */

function signupUser() {

    const nameElement =
        document.getElementById("signupName");

    const emailElement =
        document.getElementById("signupEmail");

    const passwordElement =
        document.getElementById("signupPassword");

    const roleElement =
        document.getElementById("signupRole");

    const resultElement =
        document.getElementById("signupResult");

    if (
        !nameElement ||
        !emailElement ||
        !passwordElement ||
        !roleElement
    ) {

        alert("Signup form could not be found.");
        return;
    }

    const name =
        nameElement.value.trim();

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value.trim();

    const role =
        roleElement.value;

    if (!name || !email || !password || !role) {

        if (resultElement) {
            resultElement.innerHTML =
                "<p>Please fill in all signup fields.</p>";
        }

        alert("Please fill in all signup fields.");
        return;
    }

    if (!email.includes("@")) {

        if (resultElement) {
            resultElement.innerHTML =
                "<p>Please enter a valid email address.</p>";
        }

        alert("Please enter a valid email address.");
        return;
    }

    const users =
        getUsers();

    const existingUser =
        users.find(
            user =>
                user.email &&
                user.email.toLowerCase() === email.toLowerCase()
        );

    if (existingUser) {

        if (resultElement) {
            resultElement.innerHTML =
                "<p>An account with this email already exists. Please login.</p>";
        }

        alert("An account with this email already exists.");
        return;
    }

    const user = {

        id:
            "USER-" + Date.now(),

        name:
            name,

        email:
            email,

        password:
            password,

        role:
            role,

        service:
            "",

        location:
            "",

        createdAt:
            new Date().toISOString()
    };

    saveUser(user);


    /* -----------------------------------------------------
       IMPORTANT:
       Automatically create provider profile
       ----------------------------------------------------- */

    if (role === "provider") {

        const providers =
            getProviders();

        providers.push({

            id:
                user.id,

            name:
                user.name,

            service:
                "",

            location:
                "",

            email:
                user.email,

            rating:
                0,

            reviewCount:
                0,

            completedJobs:
                0
        });

        saveProviders(providers);
    }


    if (resultElement) {

        resultElement.innerHTML =
            "<p>Account created successfully!</p>";
    }

    alert("Account created successfully!");

    showDashboard();
}


/* =========================================================
   LOGIN
   ========================================================= */

function loginUser() {

    const emailElement =
        document.getElementById("loginEmail");

    const passwordElement =
        document.getElementById("loginPassword");

    const resultElement =
        document.getElementById("loginResult");

    if (!emailElement || !passwordElement) {

        alert("Login form could not be found.");
        return;
    }

    const email =
        emailElement.value.trim();

    const password =
        passwordElement.value.trim();

    if (!email || !password) {

        if (resultElement) {

            resultElement.innerHTML =
                "<p>Please enter your email and password.</p>";
        }

        alert("Please enter your email and password.");
        return;
    }

    const users =
        getUsers();

    const user =
        users.find(
            item =>
                item.email &&
                item.email.toLowerCase() === email.toLowerCase() &&
                item.password === password
        );

    if (!user) {

        if (resultElement) {

            resultElement.innerHTML =
                "<p>Incorrect email or password.</p>";
        }

        alert("Incorrect email or password.");
        return;
    }

    storageSet(
        "deNowCurrentUser",
        JSON.stringify(user)
    );

    deNowUserData =
        user;

    /*
       Make sure an older provider account
       also gets a provider profile.
    */

    if (user.role === "provider") {
        ensureProviderProfile(user);
    }

    if (resultElement) {

        resultElement.innerHTML =
            "<p>Login successful.</p>";
    }

    showDashboard();
}


/* =========================================================
   PROVIDERS
   ========================================================= */

function getProviders() {

    try {

        const data =
            storageGet("deNowProviders");

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        return [];
    }
}

function saveProviders(providers) {

    storageSet(
        "deNowProviders",
        JSON.stringify(providers)
    );
}


/* =========================================================
   ENSURE PROVIDER PROFILE
   ========================================================= */

function ensureProviderProfile(user) {

    if (!user || user.role !== "provider") {
        return;
    }

    const providers =
        getProviders();

    const existing =
        providers.find(
            provider =>
                provider.id === user.id
        );

    if (!existing) {

        providers.push({

            id:
                user.id,

            name:
                user.name,

            service:
                user.service || "",

            location:
                user.location || "",

            email:
                user.email,

            rating:
                0,

            reviewCount:
                0,

            completedJobs:
                0,

            verified:
               false

        });

        saveProviders(providers);

        return;
    }

    /*
       Keep provider information synchronized
       with the user account.
    */

    existing.name =
        user.name;

    existing.email =
        user.email;

    if (user.service) {
        existing.service =
            user.service;
    }

    if (user.location) {
        existing.location =
            user.location;
    }

    saveProviders(providers);
}


/* =========================================================
   LOGIN / SIGNUP SWITCHING
   ========================================================= */

function showSignup() {

    const loginBox =
        document.getElementById("loginBox");

    const signupBox =
        document.getElementById("signupBox");

    if (loginBox) {
        loginBox.classList.add("hidden");
    }

    if (signupBox) {
        signupBox.classList.remove("hidden");
    }
}

function showLogin() {

    const loginBox =
        document.getElementById("loginBox");

    const signupBox =
        document.getElementById("signupBox");

    if (signupBox) {
        signupBox.classList.add("hidden");
    }

    if (loginBox) {
        loginBox.classList.remove("hidden");
    }
}


/* =========================================================
   SHOW DASHBOARD
   ========================================================= */

function showDashboard() {

    const user =
        getCurrentUser();

    if (!user) {

        showLogin();
        return;
    }

    deNowUserData =
        user;

    if (user.role === "provider") {
        ensureProviderProfile(user);
    }

    const loginBox =
        document.getElementById("loginBox");

    const signupBox =
        document.getElementById("signupBox");

    const accountDashboard =
        document.getElementById("accountDashboard");

    const dashboard =
        document.getElementById("dashboard");

    const providerDashboard =
        document.getElementById("providerDashboard");

    if (loginBox) {
        loginBox.classList.add("hidden");
    }

    if (signupBox) {
        signupBox.classList.add("hidden");
    }

    if (accountDashboard) {
        accountDashboard.classList.remove("hidden");
    }

    if (dashboard) {

        if (user.role === "customer") {
            dashboard.classList.remove("hidden");
        } else {
            dashboard.classList.add("hidden");
        }
    }

    if (providerDashboard) {

        if (user.role === "provider") {
            providerDashboard.classList.remove("hidden");
        } else {
            providerDashboard.classList.add("hidden");
        }
    }

    const welcomeUser =
        document.getElementById("welcomeUser");

    const accountRole =
        document.getElementById("accountRole");

    if (welcomeUser) {

        welcomeUser.textContent =
            "Welcome, " + user.name + "!";
    }

    if (accountRole) {

        accountRole.textContent =
            user.role === "customer"
                ? "Customer Account"
                : "Service Provider Account";
    }

    updateCustomerDashboard();
    updateProviderDashboard();

    createNotificationPanel();
    renderNotifications();
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    storageRemove(
        "deNowCurrentUser"
    );

    deNowUserData =
        null;

    const accountDashboard =
        document.getElementById("accountDashboard");

    const dashboard =
        document.getElementById("dashboard");

    const providerDashboard =
        document.getElementById("providerDashboard");

    if (accountDashboard) {
        accountDashboard.classList.add("hidden");
    }

    if (dashboard) {
        dashboard.classList.add("hidden");
    }

    if (providerDashboard) {
        providerDashboard.classList.add("hidden");
    }

    showLogin();

    alert("You have been logged out.");
}


/* =========================================================
   SERVICE REQUESTS
   ========================================================= */

function getRequests() {

    try {

        const data =
            storageGet("deNowRequests");

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        return [];
    }
}

function saveRequests(requests) {

    storageSet(
        "deNowRequests",
        JSON.stringify(requests)
    );
}


/* =========================================================
   SUBMIT CUSTOMER REQUEST
   ========================================================= */

function submitRequestLegacy() {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Please create an account or login first."
        );

        const account =
            document.getElementById("account");

        if (account) {
            account.scrollIntoView();
        }

        return;
    }

    if (user.role !== "customer") {

        alert(
            "Only customers can create service requests."
        );

        return;
    }

    const problemElement =
        document.getElementById("problem");

    const locationElement =
        document.getElementById("location");

    const urgencyElement =
        document.getElementById("urgency");

    const resultElement =
        document.getElementById("result");

    if (
        !problemElement ||
        !locationElement ||
        !urgencyElement
    ) {

        alert(
            "Request form could not be found."
        );

        return;
    }

    const problem =
        problemElement.value.trim();

    const location =
        locationElement.value.trim();

    const urgency =
        urgencyElement.value;

    const detailsElement = document.getElementById("details");
    const contactElement = document.getElementById("contact");
    const preferredTimeElement = document.getElementById("preferredTime");
    const estimatedPriceElement = document.getElementById("estimatedPrice");

    const details = detailsElement ? detailsElement.value.trim() : "";
    const contact = contactElement ? contactElement.value.trim() : "";
    const preferredTime = preferredTimeElement ? preferredTimeElement.value : "";
    const estimatedPrice = estimatedPriceElement ? estimatedPriceElement.value : "";

    if (!problem || !location || !urgency) {

        alert(
            "Please complete all request fields."
        );

        return;
    }

    const request = {

        id:
            "REQ-" + Date.now(),

        customerId:
            user.id,

        customerName:
            user.name,

        customerEmail:
            user.email,

        problem:
            problem,

        details:
            details,

        location:
            location,

        contact:
            contact,

        preferredTime:
            preferredTime,

        estimatedPrice:
            estimatedPrice,

        urgency:
            urgency,

        status:
            "Searching for provider",

        providerId:
            "",

        providerName:
            "",

        providerService:
            "",

        providerLocation:
            "",

        createdAt:
            new Date().toISOString(),

        messages:
            [],

        review:
            null
    };

    const requests =
        getRequests();

    requests.push(request);

    saveRequests(requests);


    /* -----------------------------------------------------
       NEW:
       Notify available providers immediately.
       ----------------------------------------------------- */

    notifyProvidersOfNewRequest(request);


    if (resultElement) {

        resultElement.innerHTML =
            "<p>Request submitted successfully. De Now is searching for a provider.</p>";
    }

    problemElement.value =
        "";

    locationElement.value =
        "";

    urgencyElement.value =
        "";

    if (detailsElement) detailsElement.value = "";
    if (contactElement) contactElement.value = "";
    if (preferredTimeElement) preferredTimeElement.value = "";
    if (estimatedPriceElement) estimatedPriceElement.value = "";


    updateCustomerDashboard();
    updateProviderDashboard();
    renderNotifications();

    alert(
        "Your service request has been submitted."
    );
}


/* =========================================================
   SERVICE MATCHING
   ========================================================= */

function normalizeText(text) {

    return String(text || "")
        .toLowerCase()
        .trim();
}

function serviceMatches(request, provider) {

    const problem =
        normalizeText(request.problem);

    const service =
        normalizeText(provider.service);

    /*
       If provider has not yet selected a service,
       we allow the request to appear.
    */

    if (!service) {
        return true;
    }

    if (!problem) {
        return false;
    }

    const serviceWords =
        service
            .split(/\s+/)
            .filter(word => word.length > 2);

    if (serviceWords.length === 0) {
        return true;
    }

    /*
       Exact word matching.
    */

    for (const word of serviceWords) {

        if (problem.includes(word)) {
            return true;
        }
    }

    /*
       Common service keywords.
    */

    const keywordGroups = [

        {
            words: [
                "plumber",
                "plumbing",
                "pipe",
                "water",
                "tap",
                "leak"
            ]
        },

        {
            words: [
                "electrician",
                "electrical",
                "electric",
                "wiring",
                "power",
                "socket",
                "lights"
            ]
        },

        {
            words: [
                "mechanic",
                "mechanical",
                "car",
                "vehicle",
                "engine",
                "motorcycle"
            ]
        },

        {
            words: [
                "cleaner",
                "cleaning",
                "clean",
                "house"
            ]
        },

        {
            words: [
                "carpenter",
                "carpentry",
                "wood",
                "furniture"
            ]
        },

        {
            words: [
                "builder",
                "construction",
                "building",
                "masonry"
            ]
        }
    ];

    const problemWords =
        problem.split(/\s+/);

    for (const group of keywordGroups) {

        const providerMatchesGroup =
            serviceWords.some(
                serviceWord =>
                    group.words.includes(serviceWord)
            );

        const problemMatchesGroup =
            problemWords.some(
                problemWord =>
                    group.words.includes(problemWord)
            );

        if (
            providerMatchesGroup &&
            problemMatchesGroup
        ) {
            return true;
        }
    }

    return false;
}

function locationMatches(request, provider) {

    const requestLocation =
        normalizeText(request.location);

    const providerLocation =
        normalizeText(provider.location);

    /*
       If provider has no location yet,
       allow the request.
    */

    if (!providerLocation) {
        return true;
    }

    if (!requestLocation) {
        return true;
    }

    return (
        requestLocation.includes(providerLocation) ||
        providerLocation.includes(requestLocation)
    );
}


/* =========================================================
   FIND PROVIDERS
   ========================================================= */

function findMatchingProviders(request) {

    const providers =
        getProviders();

    /*
       First try service + location.
    */

    let matches =
        providers.filter(
            provider =>
                serviceMatches(request, provider) &&
                locationMatches(request, provider)
        );

    /*
       If no exact matches exist,
       use service matching.
    */

    if (matches.length === 0) {

        matches =
            providers.filter(
                provider =>
                    serviceMatches(request, provider)
            );
    }

    /*
       IMPORTANT:
       If still no matches, ALL providers
       can see the request.

       This prevents a customer request
       from disappearing simply because
       service names are different.
    */

    if (matches.length === 0) {

        matches =
            providers.slice();
    }

    return matches;
}


/* =========================================================
   NOTIFY PROVIDERS OF NEW REQUEST
   ========================================================= */

function notifyProvidersOfNewRequest(request) {

    const providers =
        getProviders();

    const matchingProviders =
        findMatchingProviders(request);

    /*
       Avoid notifying duplicate provider IDs.
    */

    const notifiedIds =
        new Set();

    matchingProviders.forEach(
        provider => {

            if (
                provider.id &&
                !notifiedIds.has(provider.id)
            ) {

                notifiedIds.add(
                    provider.id
                );

                createNotification(

                    provider.id,

                    "New Service Request",

                    request.customerName +
                    " needs help with: " +
                    request.problem,

                    "request"
                );
            }
        }
    );
}


/* =========================================================
   CANCEL CUSTOMER REQUEST
   ========================================================= */

function cancelRequest(requestId) {
    const user = getCurrentUser();
    if (!user) {
        alert("Please login first.");
        return;
    }

    const requests = getRequests();
    const request = requests.find(r => r.id === requestId);

    if (!request || request.customerId !== user.id) {
        alert("Request not found.");
        return;
    }

    if (request.status === "Completed" || request.status === "Cancelled") {
        alert("This request cannot be cancelled.");
        return;
    }

    request.status = "Cancelled";
    request.cancelledAt = new Date().toISOString();
    saveRequests(requests);

    updateCustomerDashboard();
    updateProviderDashboard();
    renderNotifications();
    alert("Your request has been cancelled.");
}


/* =========================================================
   CUSTOMER DASHBOARD
   ========================================================= */

function updateCustomerDashboard() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "customer"
    ) {
        return;
    }

    const welcome =
        document.getElementById(
            "dashboardWelcome"
        );

    if (welcome) {

        welcome.textContent =
            "Welcome, " + user.name + ".";
    }

    const requests =
        getRequests().filter(
            request =>
                request.customerId === user.id
        );

    const countElement =
        document.getElementById(
            "requestCount"
        );

    if (countElement) {

        if (requests.length === 0) {

            countElement.textContent =
                "No requests yet.";

        } else {

            countElement.textContent =
                requests.length +
                (
                    requests.length === 1
                        ? " request"
                        : " requests"
                );
        }
    }

    renderCustomerRequests(
        requests
    );
}


/* =========================================================
   RENDER CUSTOMER REQUESTS
   ========================================================= */

function renderCustomerRequests(requests) {
    const container = document.getElementById("customerRequests");

    if (!container) {
        return;
    }

    if (!requests || requests.length === 0) {
        container.innerHTML =
            '<p class="empty-message">You have not made any service requests yet.</p>';
        return;
    }

    container.innerHTML = "";

    requests.slice().reverse().forEach(function (request) {
        const card = document.createElement("div");
        card.className = "request-card";

        const providerText = request.providerName
            ? request.providerName
            : "Searching for a provider...";

                   
        const trackingStages = [
            "Searching for provider",
            "Accepted",
            "On the Way",
            "Arrived",
            "Job Started",
            "Completed"
        ];

        const statusLabels = {
            "Searching for provider": "⏳ Waiting for a provider to respond",
            "Accepted": "✅ A provider has accepted your request",
            "On the Way": "🚗 Your provider is on the way",
            "Arrived": "📍 Your provider has arrived",
            "Job Started": "🛠️ Your service is in progress",
            "Completed": "🎉 Your service is completed",
            "Cancelled": "❌ This request was cancelled"
       };

const currentStatus = request.status || "Searching for provider";

const trackingMessage =
    statusLabels[currentStatus] ||
    "⏳ Your request is being processed";

const currentStage = trackingStages.indexOf(currentStatus);

const trackingHtml = `
    <div class="service-progress">
        <strong>📍 SERVICE PROGRESS</strong>
        <p>${trackingMessage}</p>
        <div class="service-progress-steps">
            ${trackingStages.map(function(stage, index) {
                const completed =
                    currentStage >= 0 && index <= currentStage;

                return `
                    <span class="${completed ? "progress-complete" : "progress-pending"}">
                        ${completed ? "✓ " : "○ "}${escapeHtml(stage)}
                    </span>
                `;
            }).join("")}
        </div>
    </div>
`;


        card.innerHTML = `
            <h4>${escapeHtml(request.problem || "Service request")}</h4>

            <p>
                <strong>Location:</strong>
                ${escapeHtml(request.location || "Not provided")}
            </p>

            <p>
                <strong>Urgency:</strong>
                ${escapeHtml(request.urgency || "Not specified")}
            </p>

            <p>
                <strong>Status:</strong>
                ${escapeHtml(request.status || "Pending")}
            </p>
            ${trackingHtml}

            <p>
                <strong>Provider:</strong>
                ${escapeHtml(providerText)}
            </p>

            ${
                request.providerId
                    ? `
                    <button class="action-button"
                        onclick="openChat('${request.id}')">
                        💬 Open Chat
                    </button>
                    `
                    : ""
            }

            ${
                request.status === "Completed" && !request.review
                    ? `
                    <button class="action-button"
                        onclick="openReview('${request.id}')">
                        ⭐ Rate Provider
                    </button>
                    `
                    : ""
            }

            ${
                request.review
                    ? `
                    <p>
                        ⭐ <strong>Your rating:</strong>
                        ${request.review.rating}/5
                    </p>

                    ${
                        request.review.text
                            ? `
                            <p>
                                <strong>Your review:</strong>
                                ${escapeHtml(request.review.text)}
                            </p>
                            `
                            : ""
                    }
                    `
                    : ""
            }
        `;

        container.appendChild(card);
    });
}

/* =========================================================
   PROVIDER DASHBOARD
   ========================================================= */

function updateProviderDashboard() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "provider"
    ) {
        return;
    }

    ensureProviderProfile(
        user
    );

    const welcome =
        document.getElementById(
            "providerDashboardWelcome"
        );

    if (welcome) {

        welcome.textContent =
            "Welcome, " + user.name + ".";
    }

    const providers =
        getProviders();

    const provider =
        providers.find(
            item =>
                item.id === user.id
        );

    const serviceDisplay =
        document.getElementById(
            "providerServiceDisplay"
        );

    const locationDisplay =
        document.getElementById(
            "providerLocationDisplay"
        );

    if (serviceDisplay) {

        serviceDisplay.textContent =
            provider && provider.service
                ? provider.service
                : user.service ||
                  "Service not set.";
    }

    if (locationDisplay) {

        locationDisplay.textContent =
            provider && provider.location
                ? provider.location
                : user.location ||
                  "Location not set.";
    }

    const requests =
        getRequests();


    /*
       Incoming requests:
       - not yet accepted
       - provider is allowed to see them
    */

    const incoming =
        requests.filter(
            request => {

                if (request.providerId) {
                    return false;
                }

                const matching =
                    findMatchingProviders(
                        request
                    );

                return matching.some(
                    item =>
                        item.id === user.id
                );
            }
        );


    /*
       Accepted jobs.
    */

    const accepted =
        requests.filter(
            request =>
                request.providerId === user.id &&
                request.status !== "Completed"
        );


    /*
       Completed jobs.
    */

    const completed =
        requests.filter(
            request =>
                request.providerId === user.id &&
                request.status === "Completed"
        );


    const incomingCount =
        document.getElementById(
            "incomingRequestCount"
        );

    const acceptedCount =
        document.getElementById(
            "acceptedJobCount"
        );


    if (incomingCount) {

        incomingCount.textContent =
            incoming.length === 0
                ? "No requests yet."
                : incoming.length +
                  " incoming request(s)";
    }


    if (acceptedCount) {

        acceptedCount.textContent =
            accepted.length === 0
                ? "No accepted jobs."
                : accepted.length +
                  " accepted job(s)";
    }


    renderProviderRequests(
        incoming,
        accepted,
        completed
    );
}


/* =========================================================
   PROVIDER REGISTRATION
   ========================================================= */

function registerProvider() {

    const nameElement =
        document.getElementById(
            "providerName"
        );

    const serviceElement =
        document.getElementById(
            "providerService"
        );

    const locationElement =
        document.getElementById(
            "providerLocation"
        );

    const resultElement =
        document.getElementById(
            "providerResult"
        );

    if (
        !nameElement ||
        !serviceElement ||
        !locationElement
    ) {

        alert(
            "Provider form could not be found."
        );

        return;
    }

    const name =
        nameElement.value.trim();

    const service =
        serviceElement.value.trim();

    const location =
        locationElement.value.trim();

    if (
        !name ||
        !service ||
        !location
    ) {

        alert(
            "Please complete all provider fields."
        );

        return;
    }

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "provider"
    ) {

        alert(
            "Please login using a Service Provider account first."
        );

        return;
    }

    const providers =
        getProviders();

    let provider =
        providers.find(
            item =>
                item.id === user.id
        );

        /* =========================================================
   PROVIDER VERIFICATION STATUS
   ========================================================= */

const verificationDisplay =
    document.getElementById(
        "providerVerificationStatus"
    );

if (verificationDisplay) {

    if (provider && provider.verified === true) {

        verificationDisplay.innerHTML =
            "✅ <strong>Verified Provider</strong>";

    } else {

        verificationDisplay.innerHTML =
            "❌ <strong>Not Verified</strong>";
    }
}

    if (!provider) {

        provider = {

            id:
                user.id,

            name:
                name,

            service:
                service,

            location:
                location,

            email:
                user.email,

            rating:
                0,

            reviewCount:
                0,

            completedJobs:
                0
        };

        providers.push(
            provider
        );

    } else {

        provider.name =
            name;

        provider.service =
            service;

        provider.location =
            location;
    }

    saveProviders(
        providers
    );


    /*
       Also save provider information
       inside the user account.
    */

    user.name =
        name;

    user.service =
        service;

    user.location =
        location;

    saveUser(
        user
    );


    if (resultElement) {

        resultElement.innerHTML =
            "<p>Provider profile saved successfully.</p>";
    }


    updateProviderDashboard();

    /*
       Refresh incoming requests
       immediately after profile update.
    */

    renderNotifications();

    alert(
        "Provider profile saved successfully."
    );
}


/* =========================================================
   PROVIDER REQUESTS
   ========================================================= */

function renderProviderRequests(
    incoming,
    accepted,
    completed
) {

    const container =
        document.getElementById(
            "providerRequests"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "";


    if (
        (!incoming || incoming.length === 0) &&
        (!accepted || accepted.length === 0) &&
        (!completed || completed.length === 0)
    ) {

        container.innerHTML =
            '<p class="empty-message">There are no service requests available.</p>';

        return;
    }


    /* -----------------------------------------------------
       INCOMING
       ----------------------------------------------------- */

    if (
        incoming &&
        incoming.length > 0
    ) {

        const heading =
            document.createElement(
                "h3"
            );

        heading.textContent =
            "New Requests";

        container.appendChild(
            heading
        );
    }


    incoming.forEach(
        request => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "request-card";

            card.innerHTML = `

<h4>
                    🆕 New Service Request
</h4>

<p>
<strong>Customer:</strong>
                    ${escapeHtml(
                        request.customerName
                    )}
</p>

<p>
<strong>Problem:</strong>
                    ${escapeHtml(
                        request.problem
                    )}
</p>

<p>
<strong>Location:</strong>
                    ${escapeHtml(
                        request.location
                    )}
</p>

<p>
<strong>Urgency:</strong>
                    ${escapeHtml(
                        request.urgency
                    )}
</p>

<p>
<strong>Status:</strong>
                    ${escapeHtml(
                        request.status
                    )}
</p>

<button
                    class="action-button"
                    onclick="acceptRequest('${request.id}')">

                    Accept Request

</button>
            `;

            container.appendChild(
                card
            );
        }
    );


    /* -----------------------------------------------------
       ACCEPTED JOBS
       ----------------------------------------------------- */

    if (
        accepted &&
        accepted.length > 0
    ) {

        const heading =
            document.createElement(
                "h3"
            );

        heading.style.marginTop =
            "30px";

        heading.textContent =
            "Accepted Jobs";

        container.appendChild(
            heading
        );
    }


    accepted.forEach(
        request => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "request-card";

            let actionButton =
                "";

            if (
                request.status ===
                "Accepted"
            ) {

                actionButton = `
<button
                        class="action-button"
                        onclick="updateRequestStatus('${request.id}', 'On the Way')">

                        Start Journey

</button>
                `;

            } else if (
                request.status ===
                "On the Way"
            ) {

                actionButton = `
<button
                        class="action-button"
                        onclick="updateRequestStatus('${request.id}', 'Arrived')">

                        Mark Arrived

</button>
                `;

            } else if (
                request.status ===
                "Arrived"
            ) {

                actionButton = `
<button
                        class="action-button"
                        onclick="updateRequestStatus('${request.id}', 'Job Started')">

                        Start Job

</button>
                `;

            } else if (
                request.status ===
                "Job Started"
            ) {

                actionButton = `
<button
                        class="action-button"
                        onclick="updateRequestStatus('${request.id}', 'Completed')">

                        Complete Job

</button>
                `;
            }


            card.innerHTML = `

<h4>
                    Accepted Job
</h4>

<p>
<strong>Customer:</strong>
                    ${escapeHtml(
                        request.customerName
                    )}
</p>

<p>
<strong>Problem:</strong>
                    ${escapeHtml(
                        request.problem
                    )}
</p>

<p>
<strong>Location:</strong>
                    ${escapeHtml(
                        request.location
                    )}
</p>

<p>
<strong>Status:</strong>
                    ${escapeHtml(
                        request.status
                    )}
</p>

                ${actionButton}

<button
                    class="action-button"
                    onclick="openChat('${request.id}')">

                    💬 Open Chat

</button>
            `;

            container.appendChild(
                card
            );
        }
    );


    /* -----------------------------------------------------
       COMPLETED JOBS
       ----------------------------------------------------- */

    if (
        completed &&
        completed.length > 0
    ) {

        const heading =
            document.createElement(
                "h3"
            );

        heading.style.marginTop =
            "30px";

        heading.textContent =
            "Completed Jobs";

        container.appendChild(
            heading
        );
    }


    completed.forEach(
        request => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "request-card";

            card.innerHTML = `

<h4>
                    ✅ Completed Job
</h4>

<p>
<strong>Customer:</strong>
                    ${escapeHtml(
                        request.customerName
                    )}
</p>

<p>
<strong>Problem:</strong>
                    ${escapeHtml(
                        request.problem
                    )}
</p>

<p>
<strong>Rating:</strong>
                    ${
                        request.review
                            ? request.review.rating +
                              "/5 ⭐"
                            : "Not yet rated"
                    }
</p>

                ${
                    request.review &&
                    request.review.text
                        ? `
<p>
<strong>Customer Review:</strong>
                                ${escapeHtml(
                                    request.review.text
                                )}
</p>
                          `
                        : ""
                }

<button
                    class="action-button"
                    onclick="openChat('${request.id}')">

                    💬 Open Chat

</button>
            `;

            container.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   ACCEPT REQUEST
   ========================================================= */

function acceptRequest(requestId) {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "provider"
    ) {

        alert(
            "Please login as a provider."
        );

        return;
    }

    const requests =
        getRequests();

    const request =
        requests.find(
            item =>
                item.id === requestId
        );

    if (!request) {

        alert(
            "Request could not be found."
        );

        return;
    }

    /*
       Prevent two providers from accepting
       the same job.
    */

    if (request.providerId) {

        alert(
            "This request has already been accepted by another provider."
        );

        updateProviderDashboard();

        return;
    }


    request.providerId =
        user.id;

    request.providerName =
        user.name;

    request.providerService =
        user.service || "";

    request.providerLocation =
        user.location || "";

    request.status =
        "Accepted";


    saveRequests(
        requests
    );


    /*
       Customer notification.
    */

    createNotification(

        request.customerId,

        "Request Accepted",

        user.name +
        " has accepted your service request.",

        "accepted"
    );


    /*
       Notify other providers that the
       request has been taken.
    */

    getProviders().forEach(
        provider => {

            if (
                provider.id &&
                provider.id !== user.id
            ) {

                createNotification(

                    provider.id,

                    "Request Taken",

                    "A service request you could have responded to has already been accepted.",

                    "status"
                );
            }
        }
    );


    updateCustomerDashboard();
    updateProviderDashboard();
    renderNotifications();

    alert(
        "Request accepted successfully."
    );
}


/* =========================================================
   UPDATE REQUEST STATUS
   ========================================================= */

function updateRequestStatus(
    requestId,
    newStatus
) {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "provider"
    ) {

        alert(
            "Please login as a provider."
        );

        return;
    }

    const requests =
        getRequests();

    const request =
        requests.find(
            item =>
                item.id === requestId
        );

    if (!request) {
        return;
    }

    if (
        request.providerId !== user.id
    ) {

        alert(
            "You are not assigned to this request."
        );

        return;
    }

    request.status =
        newStatus;

    saveRequests(
        requests
    );


    if (
        newStatus ===
        "On the Way"
    ) {

        createNotification(

            request.customerId,

            "Provider Is On The Way",

            user.name +
            " is on the way to your location.",

            "status"
        );
    }


    if (
        newStatus ===
        "Arrived"
    ) {

        createNotification(

            request.customerId,

            "Provider Has Arrived",

            user.name +
            " has arrived.",

            "status"
        );
    }


    if (
        newStatus ===
        "Job Started"
    ) {

        createNotification(

            request.customerId,

            "Job Started",

            "Your service provider has started the job.",

            "status"
        );
    }


    if (
        newStatus ===
        "Completed"
    ) {

        createNotification(

            request.customerId,

            "Job Completed",

            "Your service request has been completed.",

            "completed"
        );

        updateProviderRatingAfterCompletion(
            request.providerId
        );
    }


    updateCustomerDashboard();
    updateProviderDashboard();
    renderNotifications();

    alert(
        "Request status updated to: " +
        newStatus
    );
}


/* =========================================================
   PROVIDER RATING SUMMARY
   ========================================================= */

function updateProviderRatingAfterCompletion(
    providerId
) {

    const providers =
        getProviders();

    const requests =
        getRequests();

    const provider =
        providers.find(
            item =>
                item.id === providerId
        );

    if (!provider) {
        return;
    }

    const completed =
        requests.filter(
            request =>
                request.providerId === providerId &&
                request.status === "Completed"
        );

    provider.completedJobs =
        completed.length;

    const reviews =
        completed
            .filter(
                request =>
                    request.review
            )
            .map(
                request =>
                    request.review.rating
            );

    if (
        reviews.length > 0
    ) {

        const total =
            reviews.reduce(
                (sum, rating) =>
                    sum + rating,
                0
            );

        provider.rating =
            Math.round(
                (
                    total /
                    reviews.length
                ) * 10
            ) / 10;

        provider.reviewCount =
            reviews.length;

    } else {

        provider.rating =
            0;

        provider.reviewCount =
            0;
    }

    saveProviders(
        providers
    );
}


/* =========================================================
   CHAT
   ========================================================= */

function openChat(requestId) {

    const user =
        getCurrentUser();

    if (!user) {

        alert(
            "Please login first."
        );

        return;
    }

    const requests =
        getRequests();

    const request =
        requests.find(
            item =>
                item.id === requestId
        );

    if (!request) {

        alert(
            "Request not found."
        );

        return;
    }

    const allowed =
        user.id === request.customerId ||
        user.id === request.providerId;

    if (!allowed) {

        alert(
            "You are not allowed to access this chat."
        );

        return;
    }

    const oldChat =
        document.getElementById(
            "deNowChatWindow"
        );

    if (oldChat) {
        oldChat.remove();
    }

    const chat =
        document.createElement(
            "div"
        );

    chat.id =
        "deNowChatWindow";

    chat.style.position =
        "fixed";

    chat.style.right =
        "20px";

    chat.style.bottom =
        "20px";

    chat.style.width =
        "330px";

    chat.style.maxWidth =
        "90%";

    chat.style.background =
        "white";

    chat.style.border =
        "1px solid #ccc";

    chat.style.borderRadius =
        "10px";

    chat.style.padding =
        "15px";

    chat.style.zIndex =
        "9999";

    chat.style.boxShadow =
        "0 5px 20px rgba(0,0,0,0.2)";

    chat.innerHTML = `

<div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

<strong>
                Chat
</strong>

<button
                onclick="closeChat()">
                ✕
</button>

</div>

<div
            id="chatMessages"
            style="
                height:220px;
                overflow-y:auto;
                margin:10px 0;
                padding:5px;
                border:1px solid #eee;
            ">
</div>

<div
            style="
                display:flex;
                gap:5px;
            ">

<input
                id="chatInput"
                type="text"
                placeholder="Type a message..."
                style="flex:1;">

<button
                onclick="sendChatMessage('${requestId}')">

                Send

</button>

</div>
    `;

    document.body.appendChild(
        chat
    );

    renderChatMessages(
        requestId
    );

    const input =
        document.getElementById(
            "chatInput"
        );

    if (input) {

        input.focus();

        input.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    sendChatMessage(
                        requestId
                    );
                }
            }
        );
    }
}

function closeChat() {

    const chat =
        document.getElementById(
            "deNowChatWindow"
        );

    if (chat) {
        chat.remove();
    }
}

function renderChatMessages(
    requestId
) {

    const container =
        document.getElementById(
            "chatMessages"
        );

    if (!container) {
        return;
    }

    const requests =
        getRequests();

    const request =
        requests.find(
            item =>
                item.id === requestId
        );

    if (!request) {
        return;
    }

    if (!request.messages) {
        request.messages = [];
    }

    if (
        request.messages.length === 0
    ) {

        container.innerHTML =
            "<p>No messages yet.</p>";

        return;
    }

    container.innerHTML =
        "";

    request.messages.forEach(
        message => {

            const div =
                document.createElement(
                    "div"
                );

            div.style.marginBottom =
                "8px";

            div.innerHTML = `

<strong>
                    ${escapeHtml(
                        message.senderName
                    )}
</strong>

<br>

                ${escapeHtml(
                    message.text
                )}

<small>
<br>
                    ${escapeHtml(
                        message.time
                    )}
</small>
            `;

            container.appendChild(
                div
            );
        }
    );

    container.scrollTop =
        container.scrollHeight;
}

function sendChatMessage(
    requestId
) {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }

    const input =
        document.getElementById(
            "chatInput"
        );

    if (!input) {
        return;
    }

    const text =
        input.value.trim();

    if (!text) {
        return;
    }

    const requests =
        getRequests();

    const request =
        requests.find(
            item =>
                item.id === requestId
        );

    if (!request) {
        return;
    }

    if (!request.messages) {
        request.messages = [];
    }

    const now =
        new Date();

    request.messages.push({

        senderId:
            user.id,

        senderName:
            user.name,

        text:
            text,

        time:
            now.toLocaleString()
    });

    saveRequests(
        requests
    );

    const recipientId =
        user.id === request.customerId
            ? request.providerId
            : request.customerId;

    if (recipientId) {

        createNotification(

            recipientId,

            "New Message",

            user.name +
            " sent you a message.",

            "message"
        );
    }

    input.value =
        "";

    renderChatMessages(
        requestId
    );

    renderNotifications();
}


/* =========================================================
   REVIEWS
   ========================================================= */

function openReview(
    requestId
) {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "customer"
    ) {

        alert(
            "Only the customer can rate this job."
        );

        return;
    }

    const requests =
        getRequests();

    const request =
        requests.find(
            item =>
                item.id === requestId
        );

    if (!request) {
        return;
    }

    if (
        request.customerId !== user.id
    ) {

        alert(
            "You cannot review this request."
        );

        return;
    }

    if (
        request.status !==
        "Completed"
    ) {

        alert(
            "You can only review a completed job."
        );

        return;
    }

    if (request.review) {

        alert(
            "You have already reviewed this job."
        );

        return;
    }

    const oldModal =
        document.getElementById(
            "deNowReviewModal"
        );

    if (oldModal) {
        oldModal.remove();
    }

    const modal =
        document.createElement(
            "div"
        );

    modal.id =
        "deNowReviewModal";

    modal.style.position =
        "fixed";

    modal.style.left =
        "0";

    modal.style.top =
        "0";

    modal.style.width =
        "100%";

    modal.style.height =
        "100%";

    modal.style.background =
        "rgba(0,0,0,0.6)";

    modal.style.display =
        "flex";

    modal.style.alignItems =
        "center";

    modal.style.justifyContent =
        "center";

    modal.style.zIndex =
        "10000";

    modal.innerHTML = `

<div
            style="
                background:white;
                padding:25px;
                border-radius:10px;
                width:350px;
                max-width:90%;
            ">

<h3>
                Rate
                ${escapeHtml(
                    request.providerName
                )}
</h3>

<label>
                Rating
</label>

<select
                id="reviewRating">

<option value="5">
                    ⭐⭐⭐⭐⭐ - Excellent
</option>

<option value="4">
                    ⭐⭐⭐⭐ - Very Good
</option>

<option value="3">
                    ⭐⭐⭐ - Good
</option>

<option value="2">
                    ⭐⭐ - Poor
</option>

<option value="1">
                    ⭐ - Very Poor
</option>

</select>

<br><br>

<label>
                Your Review
</label>

<textarea
                id="reviewText"
                placeholder="Write your review..."
                style="
                    width:100%;
                    height:100px;
                "></textarea>

<br><br>

<button
                class="action-button"
                onclick="submitReview('${requestId}')">

                Submit Review

</button>

<button
                onclick="closeReview()">

                Cancel

</button>

</div>
    `;

    document.body.appendChild(
        modal
    );
}

function closeReview() {

    const modal =
        document.getElementById(
            "deNowReviewModal"
        );

    if (modal) {
        modal.remove();
    }
}

function submitReview(
    requestId
) {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }

    const ratingElement =
        document.getElementById(
            "reviewRating"
        );

    const textElement =
        document.getElementById(
            "reviewText"
        );

    if (
        !ratingElement ||
        !textElement
    ) {
        return;
    }

    const rating =
        Number(
            ratingElement.value
        );

    const text =
        textElement.value.trim();

    const requests =
        getRequests();

    const request =
        requests.find(
            item =>
                item.id === requestId
        );

    if (!request) {
        return;
    }

    if (request.review) {

        alert(
            "This job has already been reviewed."
        );

        return;
    }

    request.review = {

        rating:
            rating,

        text:
            text,

        customerId:
            user.id,

        customerName:
            user.name,

        createdAt:
            new Date().toISOString()
    };

    saveRequests(
        requests
    );

    updateProviderRatingAfterCompletion(
        request.providerId
    );

    createNotification(

        request.providerId,

        "New Rating & Review",

        user.name +
        " rated your completed service " +
        rating +
        "/5.",

        "review"
    );

    closeReview();

    updateCustomerDashboard();
    updateProviderDashboard();
    renderNotifications();

    alert(
        "Thank you. Your review has been submitted."
    );
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function getNotifications() {

    try {

        const data =
            storageGet(
                "deNowNotifications"
            );

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        return [];
    }
}

function saveNotifications(
    notifications
) {

    storageSet(
        "deNowNotifications",
        JSON.stringify(
            notifications
        )
    );
}

function createNotification(
    recipientId,
    title,
    message,
    type
) {

    if (!recipientId) {
        return;
    }

    const notifications =
        getNotifications();

    notifications.push({

        id:
            "NOT-" +
            Date.now() +
            "-" +
            Math.floor(
                Math.random() * 10000
            ),

        recipientId:
            recipientId,

        title:
            title,

        message:
            message,

        type:
            type || "general",

        read:
            false,

        createdAt:
            new Date().toISOString()
    });

    saveNotifications(
        notifications
    );
}

function getUserNotifications() {

    const user =
        getCurrentUser();

    if (!user) {
        return [];
    }

    return getNotifications()
        .filter(
            notification =>
                notification.recipientId ===
                user.id
        );
}

function getUnreadNotificationCount() {

    return getUserNotifications()
        .filter(
            notification =>
                !notification.read
        ).length;
}

function markNotificationAsRead(
    id
) {

    const notifications =
        getNotifications();

    const notification =
        notifications.find(
            item =>
                item.id === id
        );

    if (notification) {

        notification.read =
            true;

        saveNotifications(
            notifications
        );
    }

    renderNotifications();
}

function markAllNotificationsAsRead() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }

    const notifications =
        getNotifications();

    notifications.forEach(
        notification => {

            if (
                notification.recipientId ===
                user.id
            ) {

                notification.read =
                    true;
            }
        }
    );

    saveNotifications(
        notifications
    );

    renderNotifications();
}

function getNotificationIcon(
    type
) {

    if (type === "request") {
        return "📥";
    }

    if (type === "accepted") {
        return "✅";
    }

    if (type === "status") {
        return "🚗";
    }

    if (type === "completed") {
        return "🎉";
    }

    if (type === "message") {
        return "💬";
    }

    if (type === "review") {
        return "⭐";
    }

    return "🔔";
}


/* =========================================================
   NOTIFICATION PANEL
   ========================================================= */

function createNotificationPanel() {

    if (
        document.getElementById(
            "deNowNotificationButton"
        )
    ) {
        return;
    }

    const button =
        document.createElement(
            "button"
        );

    button.id =
        "deNowNotificationButton";

    button.innerHTML =
        "🔔 Notifications";

    button.style.position =
        "fixed";

    button.style.right =
        "20px";

    button.style.top =
        "80px";

    button.style.zIndex =
        "9998";

    button.style.padding =
        "10px 15px";

    button.style.border =
        "none";

    button.style.borderRadius =
        "8px";

    button.style.cursor =
        "pointer";

    button.onclick =
        showNotifications;

    document.body.appendChild(
        button
    );


    const panel =
        document.createElement(
            "div"
        );

    panel.id =
        "deNowNotificationPanel";

    panel.style.position =
        "fixed";

    panel.style.right =
        "20px";

    panel.style.top =
        "125px";

    panel.style.width =
        "350px";

    panel.style.maxWidth =
        "90%";

    panel.style.maxHeight =
        "450px";

    panel.style.overflowY =
        "auto";

    panel.style.background =
        "white";

    panel.style.border =
        "1px solid #ccc";

    panel.style.borderRadius =
        "10px";

    panel.style.padding =
        "15px";

    panel.style.zIndex =
        "9999";

    panel.style.boxShadow =
        "0 5px 20px rgba(0,0,0,0.2)";

    panel.style.display =
        "none";

    document.body.appendChild(
        panel
    );
}

function showNotifications() {

    let panel =
        document.getElementById(
            "deNowNotificationPanel"
        );

    if (!panel) {

        createNotificationPanel();

        panel =
            document.getElementById(
                "deNowNotificationPanel"
            );
    }

    if (!panel) {
        return;
    }

    panel.style.display =
        panel.style.display === "none"
            ? "block"
            : "none";

    renderNotifications();
}

function renderNotifications() {

    const panel =
        document.getElementById(
            "deNowNotificationPanel"
        );

    const button =
        document.getElementById(
            "deNowNotificationButton"
        );

    if (!panel) {
        return;
    }

    const notifications =
        getUserNotifications();

    const unread =
        getUnreadNotificationCount();

    if (button) {

        button.innerHTML =
            "🔔 Notifications" +
            (
                unread > 0
                    ? " (" + unread + ")"
                    : ""
            );
    }

    if (
        notifications.length === 0
    ) {

        panel.innerHTML =
            "<p>No notifications yet.</p>";

        return;
    }

    panel.innerHTML = `

<div
            style="
                display:flex;
                justify-content:space-between;
                align-items:center;
            ">

<strong>
                Notifications
</strong>

<button
                onclick="markAllNotificationsAsRead()">

                Mark all read

</button>

</div>

<hr>
    `;

    notifications
        .slice()
        .reverse()
        .forEach(
            notification => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.style.padding =
                    "10px";

                item.style.marginBottom =
                    "8px";

                item.style.borderRadius =
                    "8px";

                item.style.background =
                    notification.read
                        ? "#f5f5f5"
                        : "#e8f4ff";

                item.style.cursor =
                    "pointer";

                item.innerHTML = `

<strong>

                        ${getNotificationIcon(
                            notification.type
                        )}

                        ${escapeHtml(
                            notification.title
                        )}

</strong>

<p>
                        ${escapeHtml(
                            notification.message
                        )}
</p>

<small>
                        ${escapeHtml(
                            new Date(
                                notification.createdAt
                            ).toLocaleString()
                        )}
</small>

                    ${
                        !notification.read
                            ? "<strong> NEW</strong>"
                            : ""
                    }
                `;

                item.onclick =
                    function() {

                        markNotificationAsRead(
                            notification.id
                        );
                    };

                panel.appendChild(
                    item
                );
            }
        );
}


/* =========================================================
   SCROLL TO REQUEST
   ========================================================= */

function scrollToRequest() {

    const requestSection =
        document.getElementById(
            "request"
        );

    if (requestSection) {

        requestSection.scrollIntoView({
            behavior:
                "smooth"
        });
    }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO HTML
   ========================================================= */

window.signupUser =
    signupUser;

window.loginUser =
    loginUser;

window.showSignup =
    showSignup;

window.showLogin =
    showLogin;

window.logoutUser =
    logoutUser;

window.submitRequest =
    submitRequest;

window.registerProvider =
    registerProvider;

window.scrollToRequest =
    scrollToRequest;

window.acceptRequest =
    acceptRequest;

window.updateRequestStatus =
    updateRequestStatus;

window.openChat =
    openChat;

window.closeChat =
    closeChat;

window.sendChatMessage =
    sendChatMessage;

window.openReview =
    openReview;

window.closeReview =
    closeReview;

window.submitReview =
    submitReview;

window.showNotifications =
    showNotifications;

window.markNotificationAsRead =
    markNotificationAsRead;

window.markAllNotificationsAsRead =
    markAllNotificationsAsRead;


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "De Now page loaded successfully."
        );

        const user =
            getCurrentUser();

        if (user) {

            deNowUserData =
                user;

            showDashboard();

        } else {

            const dashboard =
                document.getElementById(
                    "dashboard"
                );

            const providerDashboard =
                document.getElementById(
                    "providerDashboard"
                );

            const accountDashboard =
                document.getElementById(
                    "accountDashboard"
                );

            if (dashboard) {
                dashboard.classList.add(
                    "hidden"
                );
            }

            if (providerDashboard) {
                providerDashboard.classList.add(
                    "hidden"
                );
            }

            if (accountDashboard) {
                accountDashboard.classList.add(
                    "hidden"
                );
            }

            showLogin();
        }
    }
);


/* =========================================================
   DE NOW V1 INTEGRATION ENHANCEMENTS
   These functions intentionally extend the original first
   version without removing its existing customer/provider,
   chat, review and notification functionality.
   ========================================================= */

let deNowPendingRequest = null;
let deNowPendingPayment = null;

const DE_NOW_SERVICE_CATALOG = {
    "Vehicle": [
        "Battery / Jump Start", "Flat Tyre", "Breakdown", "Fuel Delivery",
        "Overheating", "Towing", "Mechanical Problem", "Accident Recovery", "Other"
    ],
    "Electricity": [
        "Power Failure", "Short Circuit", "Wiring Problem", "Generator Problem",
        "Electrical Installation", "Socket / Lights", "Other"
    ],
    "Plumbing": [
        "Burst Pipe", "Blocked Toilet", "Water Leakage", "Water Pump",
        "Tank Problem", "Tap Repair", "Other"
    ],
    "Security & Access": [
        "Locksmith", "Lockout", "Door Lock Repair", "Gate Repair",
        "Security System", "Other"
    ],
    "Technology": [
        "IT Technician", "Computer Repair", "Phone Technician", "Internet / Network",
        "Software Support", "Other"
    ],
    "Home": [
        "Carpenter", "Cleaner", "Painter", "Mover", "Appliance Technician",
        "Builder / Mason", "Other"
    ],
    "Business": [
        "Office IT", "Electrical Maintenance", "Cleaning", "Security",
        "Equipment Repair", "Other"
    ],
    "Other": [
        "Tutor", "Gardener", "General Service", "Other"
    ]
};

function deNowEscape(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value == null ? "" : String(value));
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function deNowNormalize(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function deNowGetSettings() {
    try {
        const raw = localStorage.getItem("deNowSettings");
        return raw ? JSON.parse(raw) : {
            customerPlatformFee: 3000,
            providerAcceptanceFee: 1000
        };
    } catch (e) {
        return { customerPlatformFee: 3000, providerAcceptanceFee: 1000 };
    }
}

function deNowSaveSettings(settings) {
    try { localStorage.setItem("deNowSettings", JSON.stringify(settings)); } catch (e) {}
}

function deNowServiceMatches(providerService, requestedService, problem) {
    const p = deNowNormalize(providerService);
    const r = deNowNormalize(requestedService);
    const problemText = deNowNormalize(problem);
    if (!p) return false;
    if (r && (p.includes(r) || r.includes(p))) return true;

    const aliases = {
        plumber: ["plumbing", "pipe", "water", "tap", "leak", "toilet", "pump"],
        plumbing: ["plumber", "pipe", "water", "tap", "leak", "toilet", "pump"],
        electrician: ["electrical", "electricity", "wiring", "power", "generator", "socket", "lights"],
        electricity: ["electrician", "electrical", "wiring", "power", "generator", "socket", "lights"],
        mechanic: ["mechanical", "vehicle", "car", "engine", "motorcycle", "breakdown", "battery", "tyre"],
        vehicle: ["mechanic", "mechanical", "car", "engine", "motorcycle", "breakdown", "battery", "tyre"],
        cleaner: ["cleaning", "clean"],
        cleaning: ["cleaner", "clean"],
        carpenter: ["carpentry", "wood", "furniture"],
        ittechnician: ["it", "computer", "network", "software"],
        phonetechnician: ["phone", "mobile", "smartphone"]
    };

    const tokens = [p, r, problemText];
    for (const key of Object.keys(aliases)) {
        if (tokens.some(t => t === key || t.includes(key))) {
            const words = aliases[key];
            if (words.some(w => p.includes(w) || r.includes(w) || problemText.includes(w))) return true;
        }
    }
    return r ? problemText.includes(r) || p.includes(r) : true;
}

function selectService(service, category) {
    const problem = document.getElementById("problem");
    const serviceSelect = document.getElementById("requestService");
    const categoryInput = document.getElementById("requestCategory");

    if (serviceSelect) {
        serviceSelect.value = service;
    }
    if (categoryInput) categoryInput.value = category || "";
    if (problem && !problem.value.trim()) problem.value = service;

    showServiceProviders(service);
    const request = document.getElementById("request");
    if (request) request.scrollIntoView({ behavior: "smooth", block: "start" });
}

function chooseCategory(category) {
    const serviceList = DE_NOW_SERVICE_CATALOG[category] || [];
    const target = document.getElementById("serviceButtons");
    const title = document.getElementById("selectedCategoryTitle");
    if (title) title.textContent = category + " Services";
    if (!target) return;

    target.innerHTML = serviceList.map(service =>
        `<button type="button" class="service-choice" onclick="selectService('${deNowEscape(service)}','${deNowEscape(category)}')">${deNowEscape(service)}</button>`
    ).join("");

    const area = document.getElementById("serviceExamples");
    if (area) area.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showServiceProviders(service) {
    const container = document.getElementById("providerDirectory");
    const title = document.getElementById("providerDirectoryTitle");
    if (!container) return;

    if (title) title.textContent = "Providers registered for: " + service;

    const providers = typeof getProviders === "function" ? getProviders() : [];
    const matching = providers.filter(p => deNowServiceMatches(p.service, service, service));

    if (!matching.length) {
        container.innerHTML = `
            <div class="empty-message">
                <strong>No registered provider found yet.</strong>
                <p>When a provider registers this service, they will appear here.</p>
            </div>`;
        return;
    }

    container.innerHTML = matching.map(p => `
        <div class="provider-card">
            <div class="provider-avatar">👤</div>
            <div class="provider-main">
                <h4>${deNowEscape(p.name || "Service Provider")}</h4>
                <p><strong>${deNowEscape(p.service || service)}</strong></p>
                <p>📍 ${deNowEscape(p.location || "Location not provided")}</p>
                <p>⭐ ${Number(p.rating || 0).toFixed(1)} (${p.reviewCount || 0} reviews)</p>
                <span class="availability-badge ${p.online === false ? "offline" : "online"}">
                    ${p.online === false ? "OFFLINE" : "ONLINE"}
                </span>
                ${p.verified ? `<span class="verified-badge">✓ DE NOW VERIFIED</span>` : ""}
            </div>
        </div>
    `).join("");
}

function openPaymentModal(type, context) {
    const modal = document.getElementById("paymentModal");
    if (!modal) return;

    const settings = deNowGetSettings();
    const amount = type === "customer" ? Number(settings.customerPlatformFee || 3000) : Number(settings.providerAcceptanceFee || 1000);

    deNowPendingPayment = { type, context, amount };

    const title = document.getElementById("paymentTitle");
    const amountEl = document.getElementById("paymentAmount");
    const reason = document.getElementById("paymentReason");

    if (title) title.textContent = type === "customer" ? "Customer Platform Payment" : "Provider Acceptance Payment";
    if (amountEl) amountEl.textContent = "UGX " + amount.toLocaleString();
    if (reason) {
        reason.textContent = type === "customer"
            ? "This DE NOW platform fee is charged when you press Find Help."
            : "This DE NOW provider fee is charged when you accept a service request.";
    }

    modal.classList.remove("hidden");
}

function closePaymentModal() {
    const modal = document.getElementById("paymentModal");
    if (modal) modal.classList.add("hidden");
    deNowPendingPayment = null;
}

function completeDemoPayment() {
    if (!deNowPendingPayment) return;

    const method = document.getElementById("paymentMethod");
    const phone = document.getElementById("paymentPhone");
    const selectedMethod = method ? method.value : "";
    const paymentPhone = phone ? phone.value.trim() : "";

    if (!selectedMethod) {
        alert("Please select a payment method.");
        return;
    }

    if (!paymentPhone) {
        alert("Please enter the Mobile Money or payment phone number.");
        return;
    }

    const payment = {
        id: "PAY-" + Date.now(),
        userId: (getCurrentUser() || {}).id || "",
        type: deNowPendingPayment.type,
        amount: deNowPendingPayment.amount,
        method: selectedMethod,
        phone: paymentPhone,
        status: "Demo Paid",
        createdAt: new Date().toISOString(),
        contextId: deNowPendingPayment.context && deNowPendingPayment.context.id
            ? deNowPendingPayment.context.id : ""
    };

    let payments = [];
    try { payments = JSON.parse(localStorage.getItem("deNowPayments") || "[]"); } catch (e) {}
    payments.push(payment);
    try { localStorage.setItem("deNowPayments", JSON.stringify(payments)); } catch (e) {}

    const type = deNowPendingPayment.type;
    const context = deNowPendingPayment.context;

    closePaymentModal();

    if (type === "customer" && context) {
        finalizeCustomerRequest(context, payment);
    } else if (type === "provider" && context) {
        finalizeProviderAcceptance(context.id, payment);
    }
}

function finalizeCustomerRequest(data, payment) {
    const user = getCurrentUser();
    if (!user || user.role !== "customer") {
        alert("Please login as a customer first.");
        return;
    }

    const request = {
        id: "REQ-" + Date.now(),
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        service: data.service || "",
        category: data.category || "",
        problem: data.problem || "",
        details: data.details || "",
        location: data.location || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        contact: data.contact || user.phone || "",
        preferredTime: data.preferredTime || "",
        estimatedPrice: data.estimatedPrice || "",
        urgency: data.urgency || "",
        emergencyPriority:
            data.urgency === "Emergency"
                ? true
                : false,
        status: "Searching for provider",
        providerId: "",
        providerName: "",
        providerService: "",
        providerLocation: "",
        customerPaymentId: payment && payment.id ? payment.id : "",
        customerPlatformFee: payment && payment.amount ? payment.amount : 0,
        createdAt: new Date().toISOString(),
        messages: [],
        review: null
    };

    const requests = getRequests();
    requests.push(request);
    saveRequests(requests);

    if (typeof notifyProvidersOfNewRequest === "function") notifyProvidersOfNewRequest(request);

    createNotification(user.id, "Request Received",
        "Your request has been received. DE NOW is searching for a provider.",
        "request");

    updateCustomerDashboard();
    updateProviderDashboard();
    renderNotifications();
    
    deNowRunProviderMatching(request.id);

    const result = document.getElementById("result");
    if (result) result.innerHTML =
        `<div class="success-message"><strong>Request submitted.</strong><br>Payment recorded and DE NOW is searching for a matching provider.</div>`;

    const formIds = [
    "problem",
    "location",
    "latitude",
    "longitude",
    "urgency",
    "details",
    "contact",
    "preferredTime",
    "estimatedPrice",
    "requestService",
    "requestCategory"
];
    formIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    const customerRequests = document.getElementById("customerRequests");
    if (customerRequests) customerRequests.scrollIntoView({ behavior: "smooth", block: "start" });

    alert("Payment recorded. Your service request has been submitted.");
}

function finalizeProviderAcceptance(requestId, payment) {
    const user = getCurrentUser();
    if (!user || user.role !== "provider") {
        alert("Please login as a provider.");
        return;
    }

    const requests = getRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) {
        alert("Request could not be found.");
        return;
    }
    if (request.providerId) {
        alert("This request has already been accepted.");
        updateProviderDashboard();
        return;
    }

    request.providerId = user.id;
    request.providerName = user.name;
    request.providerService = user.service || "";
    request.providerLocation = user.location || "";
    request.providerPaymentId = payment && payment.id ? payment.id : "";
    request.providerAcceptanceFee = payment && payment.amount ? payment.amount : 0;
    request.status = "Accepted";

    saveRequests(requests);

    createNotification(request.customerId, "Provider Accepted",
        user.name + " has accepted your service request.", "accepted");

    createNotification(user.id, "Request Accepted",
        "You accepted " + (request.problem || "a service request") + ".", "accepted");

    getProviders().forEach(provider => {
        if (provider.id && provider.id !== user.id) {
            createNotification(provider.id, "Request Taken",
                "A request you could respond to has already been accepted.", "status");
        }
    });

    updateCustomerDashboard();
    updateProviderDashboard();
    renderNotifications();

    alert("Payment recorded. Request accepted successfully.");
}

function getRequestFormData() {
    const get = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };
    return {
        category: get("requestCategory"),
        service: get("requestService"),
        problem: get("problem"),
        details: get("details"),
        location: get("location"),
        latitude: get("latitude"),
        longitude: get("longitude"),
        contact: get("contact"),
        preferredTime: get("preferredTime"),
        estimatedPrice: get("estimatedPrice"),
        urgency: get("urgency")
    };
}

/* Override the original request function so payment happens BEFORE the request is created. */
function submitRequest() {
    try {
    const user = getCurrentUser();
    if (!user) {
        alert("Please create an account or login first.");
        const account = document.getElementById("account");
        if (account) account.scrollIntoView({ behavior: "smooth" });
        return;
    }
    if (user.role !== "customer") {
        alert("Only customers can create service requests.");
        return;
    }

    const data = getRequestFormData();

    // Find Help must work independently of the Services section.
    // If the customer has not selected a service button, use the service
    // selected in the Find Help form. If it is still blank, try the
    // customer's problem text as the service description.
    if (!data.service && data.problem) {
        data.service = data.problem;
    }

    if (!data.problem || !data.location || !data.urgency) {
        alert("Please complete the problem, location and urgency fields.");
        return;
    }

    // Find Help creates the request directly. Payment is handled separately.
    deNowPendingRequest = null;
    finalizeCustomerRequest(data, null);
    } catch (error) {
        console.error("DE NOW Find Help error:", error);
        alert("Find Help could not continue. Please check the form and try again.");
    }
}

function renderCustomerRequests(requests) {
    const container = document.getElementById("customerRequests");
    if (!container) return;

    if (!requests || requests.length === 0) {
        container.innerHTML = '<p class="empty-message">You have not made any service requests yet.</p>';
        return;
    }

    container.innerHTML = "";
    requests.slice().reverse().forEach(request => {
        const card = document.createElement("div");
        card.className = "request-card";

        const providerText = request.providerName || "Searching for a provider...";

                const trackingStages = [
            "Searching for provider",
            "Accepted",
            "On the Way",
            "Arrived",
            "Job Started",
            "Completed"
        ];

        const statusLabels = {
            "Searching for provider": "⏳ Waiting for a provider to respond",
            "Accepted": "✅ A provider has accepted your request",
            "On the Way": "🚗 Your provider is on the way",
            "Arrived": "📍 Your provider has arrived",
            "Job Started": "🛠️ Your service is in progress",
            "Completed": "🎉 Your service is completed",
            "Cancelled": "❌ This request was cancelled"
        };

        const currentStatus = request.status || "Searching for provider";

        const trackingMessage =
            statusLabels[currentStatus] ||
            "⏳ Your request is being processed";

        const currentStage = trackingStages.indexOf(currentStatus);

        const trackingHtml = `
            <div class="service-progress">
                <strong>📍 SERVICE PROGRESS</strong>
                <p>${trackingMessage}</p>
                <div class="service-progress-steps">
                    ${trackingStages.map(function(stage, index) {
                        const completed =
                            currentStage >= 0 && index <= currentStage;

                        return `
                            <span class="${completed ? "progress-complete" : "progress-pending"}">
                                ${completed ? "✓ " : "○ "}${escapeHtml(stage)}
                            </span>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
        const paymentText = request.customerPlatformFee
            ? `UGX ${Number(request.customerPlatformFee).toLocaleString()} paid`
            : "Pending";

        card.innerHTML = `
            <div class="request-top">
                <h4>${deNowEscape(request.service || request.problem || "Service request")}</h4>
                <span class="status-badge">${deNowEscape(request.status || "Pending")}</span>
            </div>
            <p><strong>Problem:</strong> ${deNowEscape(request.problem || "Not specified")}</p>
            <p><strong>Details:</strong> ${deNowEscape(request.details || "Not provided")}</p>
            <p><strong>Location:</strong> ${deNowEscape(request.location || "Not provided")}</p>
            <p><strong>Contact:</strong> ${deNowEscape(request.contact || "Not provided")}</p>
            <p><strong>Preferred time:</strong> ${deNowEscape(request.preferredTime || "Any time")}</p>
            <p><strong>Budget / estimated price:</strong> ${deNowEscape(request.estimatedPrice || "Not specified")}</p>
            <p><strong>Urgency:</strong> ${deNowEscape(request.urgency || "Not specified")}</p>
            ${trackingHtml}
            <p><strong>Provider:</strong> ${deNowEscape(providerText)}</p>
            <p><strong>Customer platform payment:</strong> ${paymentText}</p>
            ${request.providerPaymentId ? `<p><strong>Provider acceptance payment:</strong> UGX ${Number(request.providerAcceptanceFee || 0).toLocaleString()}</p>` : ""}
            <div class="request-actions">

                 ${request.providerId ? `
                     <button
                         class="action-button"
                         onclick="deNowCallProvider('${request.id}')">
                         📞 Call Provider
                    </button>
                ` : ""}

               ${request.providerId ? `
                   <button
                      class="action-button"
                      onclick="openChat('${request.id}')">
                     💬 Open Chat
                   </button>
                ` : ""}
                ${request.status === "Completed" && !request.review ? `<button class="action-button" onclick="openReview('${request.id}')">⭐ Rate Provider</button>` : ""}
                ${!request.providerId && !["Completed","Cancelled"].includes(request.status) ? `<button class="danger-button" onclick="cancelRequest('${request.id}')">Cancel Request</button>` : ""}
            </div>
            ${request.review ? `<p class="review-summary">⭐ Your rating: ${request.review.rating}/5${request.review.text ? " — " + deNowEscape(request.review.text) : ""}</p>` : ""}
        `;
        container.appendChild(card);
    });
}

function updateCustomerDashboard() {
    const user = getCurrentUser();
    if (!user || user.role !== "customer") return;

    const welcome = document.getElementById("dashboardWelcome");
    if (welcome) welcome.textContent = "Welcome, " + user.name + ".";

    const requests = getRequests().filter(r => r.customerId === user.id);
    const countElement = document.getElementById("requestCount");
    if (countElement) countElement.textContent = requests.length ? requests.length + (requests.length === 1 ? " request" : " requests") : "No requests yet.";

    const active = requests.filter(r => !["Completed","Cancelled"].includes(r.status)).length;
    const completed = requests.filter(r => r.status === "Completed").length;
    const activeEl = document.getElementById("customerActiveCount");
    const completedEl = document.getElementById("customerCompletedCount");
    if (activeEl) activeEl.textContent = active;
    if (completedEl) completedEl.textContent = completed;

    renderCustomerRequests(requests);
}

function renderProviderRequests(incoming, accepted, completed) {
    const container = document.getElementById("providerRequests");
    if (!container) return;
    container.innerHTML = "";

    if ((!incoming || !incoming.length) && (!accepted || !accepted.length) && (!completed || !completed.length)) {
        container.innerHTML = '<p class="empty-message">There are no service requests available.</p>';
        return;
    }

    const addSection = (title, items, mode) => {
        if (!items || !items.length) return;
        const heading = document.createElement("h3");
        heading.className = "subsection-title";
        heading.textContent = title;
        container.appendChild(heading);

        items.forEach(request => {
            const card = document.createElement("div");
            card.className = "request-card";

            let buttons = "";
            if (mode === "incoming") {
                buttons = `<button class="action-button" onclick="acceptRequest('${request.id}')">Accept Request</button>
                           <button class="danger-button" onclick="declineRequest('${request.id}')">Decline</button>`;
            } else if (mode === "accepted") {

    if (request.status === "Accepted") {
        buttons += `<button class="action-button" onclick="updateRequestStatus('${request.id}','On the Way')">Start Journey</button>`;
    }

    else if (request.status === "On the Way") {
        buttons += `<button class="action-button" onclick="updateRequestStatus('${request.id}','Arrived')">Mark Arrived</button>`;
    }

    else if (request.status === "Arrived") {
        buttons += `<button class="action-button" onclick="updateRequestStatus('${request.id}','Job Started')">Start Job</button>`;
    }

    else if (request.status === "Job Started") {
        buttons += `<button class="action-button" onclick="updateRequestStatus('${request.id}','Completed')">Mark Completed</button>`;
    }

    /* CUSTOMER NAVIGATION */

    if (
        Number.isFinite(Number(request.latitude)) &&
        Number.isFinite(Number(request.longitude))
    ) {

        buttons += `
            <button
                class="action-button"
                onclick="deNowNavigateToCustomer('${request.id}')">

                🗺️ Navigate to Customer

            </button>
        `;
    }

    buttons += `
       <button
           class="action-button"
           onclick="deNowCallCustomer('${request.id}')">

            📞 Call Customer

       </button>

       <button
           class="action-button"
           onclick="openChat('${request.id}')">

           💬 Chat Customer

       </button>
    `;
}

            card.innerHTML = `
                <div class="request-top">
                    <h4>${mode === "incoming" ? (request.emergencyPriority === true ? "🚨 EMERGENCY REQUEST" : "🆕 New Service Request") : "📋 " + deNowEscape(request.service || request.problem)}</h4>
                    <span class="status-badge">${deNowEscape(request.status || "")}</span>
                </div>
                <p><strong>Customer:</strong> ${deNowEscape(request.customerName)}</p>
                <p><strong>Service:</strong> ${deNowEscape(request.service || "General Service")}</p>
                <p><strong>Problem:</strong> ${deNowEscape(request.problem)}</p>

                ${
    request.photo
        ? `
            <button
                type="button"
                class="action-button"
                onclick="deNowOpenCustomerPhoto('${request.id}')"

                📷 View Problem Photo

            </button>
          `
        : ""
}
                <p><strong>Details:</strong> ${deNowEscape(request.details || "Not provided")}</p>
                <p><strong>Location:</strong> ${deNowEscape(request.location)}</p>
                <p><strong>Contact:</strong> ${deNowEscape(request.contact || "Not provided")}</p>
                <p><strong>Preferred time:</strong> ${deNowEscape(request.preferredTime || "Any time")}</p>
                <p><strong>Budget:</strong> ${deNowEscape(request.estimatedPrice || "Not specified")}</p>
                <p><strong>Urgency:</strong> ${deNowEscape(request.urgency)}</p>

                ${request.emergencyPriority === true ? `
                    <div class="emergency-alert">
                         🚨 <strong>EMERGENCY</strong> — This customer needs the fastest possible response.
                    </div>
                ` : ""}
                ${request.providerAcceptanceFee ? `<p><strong>Your DE NOW payment:</strong> UGX ${Number(request.providerAcceptanceFee).toLocaleString()}</p>` : ""}
                <div class="request-actions">${buttons}</div>
            `;
            container.appendChild(card);
        });
    };

    const sortedIncoming = (incoming || []).slice().sort((a, b) => {
    const priority = {
        Emergency: 1,
        Priority: 2,
        Standard: 3
    };

    return (priority[a.urgency] || 4) - (priority[b.urgency] || 4);
});

    addSection("New Requests", sortedIncoming, "incoming");
    addSection("Accepted Jobs", accepted, "accepted");
    addSection("Completed Jobs", completed, "completed");
}

function updateProviderDashboard() {
    const user = getCurrentUser();
    if (!user || user.role !== "provider") return;

    ensureProviderProfile(user);

    const providers = getProviders();
    const provider = providers.find(p => p.id === user.id);

    const welcome = document.getElementById("providerDashboardWelcome");
    if (welcome) welcome.textContent = "Welcome, " + user.name + ".";

    const serviceDisplay = document.getElementById("providerServiceDisplay");
    const locationDisplay = document.getElementById("providerLocationDisplay");
    if (serviceDisplay) serviceDisplay.textContent = provider && provider.service ? provider.service : "Service not set.";
    if (locationDisplay) locationDisplay.textContent = provider && provider.location ? provider.location : "Location not set.";

    const all = getRequests();
    const incoming = all.filter(r => !r.providerId && deNowServiceMatches(provider ? provider.service : user.service, r.service || r.problem, r.problem));
    const accepted = all.filter(r => r.providerId === user.id && r.status !== "Completed" && r.status !== "Cancelled");
    const completed = all.filter(r => r.providerId === user.id && r.status === "Completed");

    const incomingCount = document.getElementById("incomingRequestCount");
    const acceptedCount = document.getElementById("acceptedJobCount");
    const completedCount = document.getElementById("providerCompletedCount");
    if (incomingCount) incomingCount.textContent = incoming.length ? incoming.length + " incoming request(s)" : "No requests yet.";
    if (acceptedCount) acceptedCount.textContent = accepted.length ? accepted.length + " accepted job(s)" : "No accepted jobs.";
    if (completedCount) completedCount.textContent = completed.length;

    const onlineToggle = document.getElementById("providerOnline");
    if (onlineToggle) onlineToggle.checked = provider ? provider.online !== false : true;

    renderProviderRequests(incoming, accepted, completed);
}

function toggleProviderAvailability() {
    const user = getCurrentUser();
    if (!user || user.role !== "provider") return;

    const providers = getProviders();
    const provider = providers.find(p => p.id === user.id);
    if (!provider) return;

    const checkbox = document.getElementById("providerOnline");
    provider.online = checkbox ? checkbox.checked : true;
    saveProviders(providers);

    user.online = provider.online;
    saveUser(user);

    const status = document.getElementById("availabilityStatus");
    if (status) status.textContent = provider.online ? "ONLINE — accepting requests" : "OFFLINE — not accepting new requests";

    updateProviderDashboard();
}

function registerProvider() {
    const user = getCurrentUser();
    if (!user || user.role !== "provider") {
        alert("Please create or login to a Service Provider account first.");
        const account = document.getElementById("account");
        if (account) account.scrollIntoView({ behavior: "smooth" });
        return;
    }

    const get = id => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };

    const name = get("providerName") || user.name;
    const service = get("providerService");
    const location = get("providerLocation");
    const phone = get("providerPhone");
    const experience = get("providerExperience");
    const price = get("providerPrice");

    if (!name || !service || !location) {
        alert("Please complete your name, service and service location.");
        return;
    }

    const providers = getProviders();
    let provider = providers.find(p => p.id === user.id);

    if (!provider) {
        provider = {
            id: user.id, name, service, location, email: user.email,
            phone, experience, price, rating: 0, reviewCount: 0,
            completedJobs: 0, online: true, verified: false
        };
        providers.push(provider);
    } else {
        Object.assign(provider, { name, service, location, phone, experience, price });
        if (provider.online === undefined) provider.online = true;
    }

    saveProviders(providers);

    user.name = name;
    user.service = service;
    user.location = location;
    user.phone = phone;
    user.providerExperience = experience;
    user.providerPrice = price;
    saveUser(user);

    const result = document.getElementById("providerResult");
    if (result) result.innerHTML = `<div class="success-message">Provider profile saved successfully. Your service will now appear to customers.</div>`;

    showServiceProviders(service);
    updateProviderDashboard();
    renderNotifications();

    alert("Provider profile saved successfully.");
}

function declineRequest(requestId) {
    const user = getCurrentUser();
    if (!user || user.role !== "provider") return;

    createNotification(user.id, "Request Declined",
        "You declined this service request.", "status");

    renderNotifications();
    updateProviderDashboard();
}

function acceptRequest(requestId) {
    const user = getCurrentUser();
    if (!user || user.role !== "provider") {
        alert("Please login as a provider.");
        return;
    }

    const request = getRequests().find(r => r.id === requestId);
    if (!request) {
        alert("Request could not be found.");
        return;
    }
    if (request.providerId) {
        alert("This request has already been accepted by another provider.");
        updateProviderDashboard();
        return;
    }

    const provider = getProviders().find(p => p.id === user.id);
    if (provider && provider.online === false) {
        alert("You are currently offline. Turn your status ONLINE before accepting requests.");
        return;
    }

    // Accept Request works directly. Provider payment is handled separately.
    finalizeProviderAcceptance(requestId, null);
}

function updateRequestStatus(requestId, newStatus) {
    const user = getCurrentUser();
    if (!user || user.role !== "provider") {
        alert("Please login as a provider.");
        return;
    }

    const requests = getRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request || request.providerId !== user.id) {
        alert("You are not assigned to this request.");
        return;
    }

    request.status = newStatus;
    saveRequests(requests);

    const messages = {
        "On the Way": ["Provider Is On The Way", user.name + " is on the way to your location."],
        "Arrived": ["Provider Has Arrived", user.name + " has arrived at your location."],
        "Job Started": ["Job Started", "Your service provider has started the job."],
        "Completed": ["Job Completed", "Your service request has been completed."]
    };

    if (messages[newStatus]) {
        createNotification(request.customerId, messages[newStatus][0], messages[newStatus][1], "status");
    }

    if (newStatus === "Completed") {
        updateProviderRatingAfterCompletion(request.providerId);
    }

    updateCustomerDashboard();
    updateProviderDashboard();
    renderNotifications();

    alert("Request status updated to: " + newStatus);
}

/* Override dashboard display so the correct dashboard is always visible. */
function showDashboard() {
    const user = getCurrentUser();
    if (!user) {
        showLogin();
        return;
    }

    deNowUserData = user;
    if (user.role === "provider") ensureProviderProfile(user);

    ["loginBox","signupBox"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });

    const accountDashboard = document.getElementById("accountDashboard");
    if (accountDashboard) accountDashboard.classList.remove("hidden");

    const dashboard = document.getElementById("dashboard");
    const providerDashboard = document.getElementById("providerDashboard");

    if (dashboard) {
        if (user.role === "customer") dashboard.classList.remove("hidden");
        else dashboard.classList.add("hidden");
    }
    if (providerDashboard) {
        if (user.role === "provider") providerDashboard.classList.remove("hidden");
        else providerDashboard.classList.add("hidden");
    }

    const welcome = document.getElementById("welcomeUser");
    const role = document.getElementById("accountRole");
    if (welcome) welcome.textContent = "Welcome, " + user.name + "!";
    if (role) role.textContent = user.role === "customer" ? "Customer Account" : "Service Provider Account";

    updateCustomerDashboard();
    updateProviderDashboard();
    createNotificationPanel();
    renderNotifications();

    const target = user.role === "provider" ? providerDashboard : dashboard;
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}

function logoutUser() {
    storageRemove("deNowCurrentUser");
    deNowUserData = null;
    ["accountDashboard","dashboard","providerDashboard"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });
    showLogin();
    const account = document.getElementById("account");
    if (account) account.scrollIntoView({ behavior: "smooth" });
    alert("You have been logged out.");
}

function updateServiceDirectory() {
    const providers = getProviders();
    const all = document.getElementById("providerDirectory");
    if (!all) return;
    if (!providers.length) {
        all.innerHTML = '<p class="empty-message">No service providers have registered yet.</p>';
    }
}

function loadProviderProfileForm() {
    const user = getCurrentUser();
    if (!user || user.role !== "provider") return;
    const provider = getProviders().find(p => p.id === user.id);
    const values = {
        providerName: user.name,
        providerService: provider ? provider.service : user.service,
        providerLocation: provider ? provider.location : user.location,
        providerPhone: provider ? provider.phone : user.phone,
        providerExperience: provider ? provider.experience : user.providerExperience,
        providerPrice: provider ? provider.price : user.providerPrice
    };
    Object.keys(values).forEach(id => {
        const el = document.getElementById(id);
        if (el && values[id] != null) el.value = values[id];
    });
}

function renderPaymentHistory() {
    const user = getCurrentUser();
    const box = document.getElementById("paymentHistory");
    if (!box || !user) return;

    let payments = [];
    try { payments = JSON.parse(localStorage.getItem("deNowPayments") || "[]"); } catch (e) {}

    const mine = payments.filter(p => p.userId === user.id).slice().reverse();
    if (!mine.length) {
        box.innerHTML = '<p class="empty-message">No payments recorded yet.</p>';
        return;
    }

    box.innerHTML = mine.map(p => `
        <div class="payment-row">
            <strong>${p.type === "customer" ? "Customer platform fee" : "Provider acceptance fee"}</strong>
            <span>UGX ${Number(p.amount).toLocaleString()}</span>
            <small>${deNowEscape(p.method)} • ${deNowEscape(p.status)}</small>
        </div>
    `).join("");
}

/* ADMIN PROTOTYPE */
function showAdminPanel() {
    const user = getCurrentUser();
    const panel = document.getElementById("adminDashboard");
    if (!panel) return;
    if (!user || user.role !== "admin") {
        alert("Admin access only.");
        return;
    }
    panel.classList.remove("hidden");
    renderAdminDashboard();
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderAdminDashboard() {
    const users = getUsers();
    const providers = getProviders();
    const requests = getRequests();
    let payments = [];
    try { payments = JSON.parse(localStorage.getItem("deNowPayments") || "[]"); } catch (e) {}

    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    set("adminCustomerCount", users.filter(u => u.role === "customer").length);
    set("adminProviderCount", providers.length);
    set("adminActiveJobs", requests.filter(r => !["Completed","Cancelled"].includes(r.status)).length);
    set("adminRevenue", "UGX " + payments.reduce((sum,p) => sum + Number(p.amount || 0), 0).toLocaleString());

    const list = document.getElementById("adminProviderList");
    if (list) {
        list.innerHTML = providers.length ? providers.map(p => `
            <div class="admin-row">
                <div><strong>${deNowEscape(p.name)}</strong><br>${deNowEscape(p.service)} • ${deNowEscape(p.location)}</div>
                <div>
                    <span class="${p.verified ? "verified-badge" : "pending-badge"}">${p.verified ? "VERIFIED" : "PENDING"}</span>
                    <button class="small-button" onclick="setProviderVerification('${p.id}',true)">Verify</button>
                    <button class="small-button" onclick="setProviderVerification('${p.id}',false)">Unverify</button>
                </div>
            </div>
        `).join("") : '<p class="empty-message">No providers registered.</p>';
    }
}

function setProviderVerification(providerId, value) {
    const providers = getProviders();
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;
    provider.verified = !!value;
    saveProviders(providers);
    createNotification(provider.id,
        value ? "DE NOW Verification Approved" : "Verification Status Updated",
        value ? "Your provider profile has been verified by DE NOW." : "Your provider verification status has changed.",
        "status");
    renderAdminDashboard();
    renderNotifications();
}

/* Add missing optional IDs to the window explicitly after all overrides. */
window.submitRequest = submitRequest;
window.selectService = selectService;
window.chooseCategory = chooseCategory;
window.showServiceProviders = showServiceProviders;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.completeDemoPayment = completeDemoPayment;
window.toggleProviderAvailability = toggleProviderAvailability;
window.declineRequest = declineRequest;
window.showAdminPanel = showAdminPanel;
window.renderPaymentHistory = renderPaymentHistory;


document.addEventListener("DOMContentLoaded", function () {
    const findHelpButton = document.querySelector("button[onclick=\"submitRequest()\"]");
    if (findHelpButton) {
        findHelpButton.addEventListener("click", function (event) {
            event.preventDefault();
            submitRequest();
        });
    }

    const serviceSelect = document.getElementById("requestService");
    if (serviceSelect && serviceSelect.options.length <= 1) {
        Object.values(DE_NOW_SERVICE_CATALOG).flat().filter((v,i,a)=>a.indexOf(v)===i).forEach(service => {
            const option = document.createElement("option");
            option.value = service;
            option.textContent = service;
            serviceSelect.appendChild(option);
        });
    }

    const user = getCurrentUser();
    if (user) {
        showDashboard();
        loadProviderProfileForm();
        renderPaymentHistory();
        const providerHistory = document.getElementById("providerPaymentHistory");
        if (providerHistory && user.role === "provider") {
            renderPaymentHistory();
            const payments = JSON.parse(localStorage.getItem("deNowPayments") || "[]");
            const mine = payments.filter(p => p.userId === user.id).slice().reverse();
            providerHistory.innerHTML = mine.length ? mine.map(p => `
                <div class="payment-row">
                    <strong>Provider acceptance fee</strong>
                    <span>UGX ${Number(p.amount).toLocaleString()}</span>
                    <small>${deNowEscape(p.method)} • ${deNowEscape(p.status)}</small>
                </div>`).join("") : '<p class="empty-message">No payments recorded yet.</p>';
        }
    } else {
        ["dashboard","providerDashboard","accountDashboard"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });
        showLogin();
    }
});


// ===============================
// DE NOW ADMIN DASHBOARD
// ===============================

function openAdminDashboard() {
  const password = prompt("Enter DE NOW Admin Password:");

  if (password !== "DENOWADMIN2026") {
    alert("Access denied. Incorrect admin password.");
    return;
  }

  const adminDashboard = document.getElementById("adminDashboard");

  if (adminDashboard) {
    adminDashboard.classList.remove("hidden");
    adminDashboard.scrollIntoView({
      behavior: "smooth"
    });
  }

  loadAdminDashboard();
}


// ===============================
// LOAD ADMIN DASHBOARD
// ===============================

function loadAdminDashboard() {

  // Get the actual DE NOW data
  const users =
    JSON.parse(localStorage.getItem("deNowUser") || "null");

  const requests =
    JSON.parse(localStorage.getItem("deNowRequests") || "[]");

  const providers =
    JSON.parse(localStorage.getItem("deNowProviders") || "[]");


  // -------------------------------
  // CUSTOMER COUNT
  // -------------------------------

  let customerCount = 0;

  if (Array.isArray(users)) {

    customerCount = users.filter(function(user) {
      return user && user.role === "customer";
    }).length;

  } else if (users && users.role === "customer") {

    customerCount = 1;

  }


  // -------------------------------
  // PROVIDER COUNT
  // -------------------------------

  let providerCount = 0;

  if (Array.isArray(providers)) {
    providerCount = providers.length;
  }


  // -------------------------------
  // ACTIVE JOBS
  // -------------------------------

  let activeJobs = 0;

  if (Array.isArray(requests)) {

    activeJobs = requests.filter(function(request) {

      const status =
        String(request.status || "").toLowerCase();

      return (
        status === "pending" ||
        status === "accepted" ||
        status === "in progress" ||
        status === "active"
      );

    }).length;

  }


  // -------------------------------
  // UPDATE CUSTOMER COUNT
  // -------------------------------

  const customerElement =
    document.getElementById("adminCustomerCount");

  if (customerElement) {
    customerElement.textContent = customerCount;
  }


  // -------------------------------
  // UPDATE PROVIDER COUNT
  // -------------------------------

  const providerElement =
    document.getElementById("adminProviderCount");

  if (providerElement) {
    providerElement.textContent = providerCount;
  }


  // -------------------------------
  // UPDATE ACTIVE JOBS
  // -------------------------------

  const activeElement =
    document.getElementById("adminActiveJobs");

  if (activeElement) {
    activeElement.textContent = activeJobs;
  }


  // -------------------------------
  // PLATFORM REVENUE
  // -------------------------------

  const revenueElement =
    document.getElementById("adminRevenue");

  if (revenueElement) {
    revenueElement.textContent = "UGX 0";
  }


  // Load provider verification list
  loadAdminProviderList();
}


// ===============================
// ADMIN PROVIDER LIST
// ===============================

function loadAdminProviderList() {

  const container =
    document.getElementById("adminProviderList");

  if (!container) {
    return;
  }


  const providers =
    JSON.parse(
      localStorage.getItem("deNowProviders") || "[]"
    );


  if (providers.length === 0) {

    container.innerHTML =
      '<p class="empty-message">No registered providers found.</p>';

    return;
  }


  container.innerHTML = "";


  providers.forEach(function(provider, index) {

    const card = document.createElement("div");

    card.className = "admin-provider-card";


    const verified =
      provider.verified === true;


    card.innerHTML = `
      <div>
        <h4>${provider.name || "Unnamed Provider"}</h4>

        <p>
          <strong>Service:</strong>
          ${provider.service || "Not provided"}
        </p>

        <p>
          <strong>Location:</strong>
          ${provider.location || "Not provided"}
        </p>

        <p>
          <strong>Phone:</strong>
          ${provider.phone || "Not provided"}
        </p>

        <p>
          <strong>Status:</strong>
          ${verified ? "VERIFIED" : "PENDING VERIFICATION"}
        </p>
      </div>

      <div>
        ${
          verified
          ?
          `<button class="action-button"
             onclick="unverifyProvider(${index})">
             Remove Verification
           </button>`
          :
          `<button class="action-button"
             onclick="verifyProvider(${index})">
             Verify Provider
           </button>`
        }
      </div>
    `;


    container.appendChild(card);

  });
}


// ===============================
// VERIFY PROVIDER
// ===============================

function verifyProvider(index) {

  const providers =
    JSON.parse(
      localStorage.getItem("deNowProviders") || "[]"
    );


  if (!providers[index]) {
    return;
  }


  providers[index].verified = true;


  localStorage.setItem(
    "deNowProviders",
    JSON.stringify(providers)
  );


  alert("Provider verified successfully.");

  loadAdminDashboard();
}


// ===============================
// REMOVE PROVIDER VERIFICATION
// ===============================

function unverifyProvider(index) {

  const providers =
    JSON.parse(
      localStorage.getItem("deNowProviders") || "[]"
    );


  if (!providers[index]) {
    return;
  }


  providers[index].verified = false;


  localStorage.setItem(
    "deNowProviders",
    JSON.stringify(providers)
  );


  alert("Provider verification removed.");

  loadAdminDashboard();
}

/* =========================================================
   DE NOW - MY BOOKINGS
   Customer booking history
   This feature extends the existing request system.
   It does not modify the Admin Dashboard.
   ========================================================= */

function deNowGetBookingGroup(status) {

    if (status === "Completed") {
        return "completed";
    }

    if (status === "Cancelled") {
        return "cancelled";
    }

    return "ongoing";
}


function deNowGetCustomerBookings() {

    const user = getCurrentUser();

    if (!user) {
        return [];
    }

    if (user.role !== "customer") {
        return [];
    }

    return getRequests().filter(function(request) {

        return request.customerId === user.id;

    });
}


function deNowGetBookingPayment(request) {

    let payments = [];

    try {

        payments = JSON.parse(
            localStorage.getItem("deNowPayments") || "[]"
        );

    } catch (error) {

        payments = [];

    }

    const payment = payments.find(function(item) {

        return item.contextId === request.id;

    });

    if (payment) {

        return Number(payment.amount || 0);

    }

    return Number(request.customerPlatformFee || 0);
}


function deNowShowBookings(filter) {

    filter = filter || "all";

    const container =
        document.getElementById("bookingHistory");

    if (!container) {
        return;
    }


    const user = getCurrentUser();


    /* -----------------------------------------
       NOT LOGGED IN
       ----------------------------------------- */

    if (!user) {

        container.innerHTML = `
            <div class="empty-message">
                <h3>Login Required</h3>

                <p>
                    Please login to view your DE NOW bookings.
                </p>

                <button
                    class="action-button"
                    onclick="document.getElementById('account').scrollIntoView({behavior:'smooth'})">
                    Login to DE NOW
                </button>
            </div>
        `;

        return;
    }


    /* -----------------------------------------
       PROVIDER ACCOUNT
       ----------------------------------------- */

    if (user.role !== "customer") {

        container.innerHTML = `
            <div class="empty-message">

                <h3>Customer Bookings</h3>

                <p>
                    My Bookings is available for customer accounts.
                </p>

            </div>
        `;

        return;
    }


    /* -----------------------------------------
       UPDATE ACTIVE TAB
       ----------------------------------------- */

    const tabs =
        document.querySelectorAll(".booking-tab");

    tabs.forEach(function(tab) {

        if (tab.dataset.filter === filter) {

            tab.classList.add("active");

        } else {

            tab.classList.remove("active");

        }

    });


    /* -----------------------------------------
       GET BOOKINGS
       ----------------------------------------- */

    const bookings =
        deNowGetCustomerBookings();


    /* -----------------------------------------
       FILTER BOOKINGS
       ----------------------------------------- */

    const filteredBookings =
        bookings.filter(function(request) {

            const group =
                deNowGetBookingGroup(request.status);

            if (filter === "all") {
                return true;
            }

            return group === filter;

        });


    /* -----------------------------------------
       NO BOOKINGS
       ----------------------------------------- */

    if (filteredBookings.length === 0) {

        let message =
            "You do not have any bookings in this section.";

        if (filter === "all") {
            message =
                "You have not made any DE NOW bookings yet.";
        }

        container.innerHTML = `
            <div class="empty-message">

                <div style="font-size:40px;">📋</div>

                <h3>No Bookings Found</h3>

                <p>${escapeHtml(message)}</p>

                <button
                    class="action-button"
                    onclick="document.getElementById('request').scrollIntoView({behavior:'smooth'})">
                    🚨 Request Help
                </button>

            </div>
        `;

        return;
    }


    /* -----------------------------------------
       BUILD BOOKING CARDS
       ----------------------------------------- */

    container.innerHTML = "";

    filteredBookings
        .slice()
        .reverse()
        .forEach(function(request) {

            const group =
                deNowGetBookingGroup(request.status);

            const amount =
                deNowGetBookingPayment(request);

            let statusClass =
                "booking-status status-ongoing";

            if (group === "completed") {

                statusClass =
                    "booking-status status-completed";

            }

            if (group === "cancelled") {

                statusClass =
                    "booking-status status-cancelled";

            }


            const provider =
                request.providerName
                    ? request.providerName
                    : "Searching for provider...";


            const service =
                request.service ||
                request.problem ||
                "DE NOW Service";


            const createdDate = request.createdAt
                ? new Date(request.createdAt).toLocaleString()
                : "Date not available";


            const card =
                document.createElement("div");

            card.className =
                "booking-item";


            let buttons = "";


            /* ---------------------------------
               CHAT
               --------------------------------- */

            if (
                request.providerId &&
                typeof openChat === "function"
            ) {

                buttons += `
                    <button
                        class="action-button"
                        onclick="openChat('${request.id}')">
                        💬 Chat
                    </button>
                `;

            }


            /* ---------------------------------
               CANCEL
               --------------------------------- */

            if (
                group === "ongoing"
            ) {

                buttons += `
                    <button
                        class="action-button booking-cancel-button"
                        onclick="deNowCancelBooking('${request.id}')">
                        Cancel Booking
                    </button>
                `;

            }


            card.innerHTML = `

                <div class="booking-top">

                    <div>

                        <span class="eyebrow">
                            DE NOW BOOKING
                        </span>

                        <h3>
                            ${escapeHtml(service)}
                        </h3>

                    </div>

                    <span class="${statusClass}">
                        ${escapeHtml(request.status || "Unknown")}
                    </span>

                </div>


                <div class="booking-details">

                    <p>
                        <strong>Provider:</strong>
                        ${escapeHtml(provider)}
                    </p>

                    <p>
                        <strong>Problem:</strong>
                        ${escapeHtml(request.problem || "Not provided")}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${escapeHtml(request.location || "Not provided")}
                    </p>

                    <p>
                        <strong>Urgency:</strong>
                        ${escapeHtml(request.urgency || "Not specified")}
                    </p>

                    <p>
                        <strong>Booking Date:</strong>
                        ${escapeHtml(createdDate)}
                    </p>

                    <p>
                        <strong>DE NOW Platform Fee:</strong>
                        UGX ${amount.toLocaleString()}
                    </p>

                </div>


                ${
                    request.details
                        ? `
                            <div class="booking-description">

                                <strong>Details:</strong>

                                <p>
                                    ${escapeHtml(request.details)}
                                </p>

                            </div>
                          `
                        : ""
                }


                ${
                    buttons
                        ? `
                            <div class="booking-actions">
                                ${buttons}
                            </div>
                          `
                        : ""
                }

            `;


            container.appendChild(card);

        });

}


/* =========================================================
   CANCEL BOOKING FROM MY BOOKINGS
   ========================================================= */

function deNowCancelBooking(requestId) {

    const user = getCurrentUser();

    if (!user) {

        alert("Please login first.");

        return;
    }


    if (user.role !== "customer") {

        alert("Only customers can cancel bookings.");

        return;
    }


    const request =
        getRequests().find(function(item) {

            return item.id === requestId;

        });


    if (!request) {

        alert("Booking could not be found.");

        return;
    }


    if (request.customerId !== user.id) {

        alert("You cannot cancel this booking.");

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to cancel this booking?"
        );


    if (!confirmed) {

        return;
    }


    if (typeof cancelRequest === "function") {

        cancelRequest(requestId);

        setTimeout(function() {

            deNowShowBookings("all");

        }, 100);

    } else {

        alert(
            "The booking cancellation system is not available."
        );

    }

}


/* =========================================================
   MAKE BOOKING FUNCTIONS AVAILABLE TO HTML
   ========================================================= */

window.deNowShowBookings =
    deNowShowBookings;

window.deNowCancelBooking =
    deNowCancelBooking;


/* =========================================================
   START MY BOOKINGS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        deNowShowBookings("all");

    }
);

/* =========================================================
   DE NOW - CURRENT GPS LOCATION
   Customer location feature
   ========================================================= */

function deNowUseCurrentLocation() {

    const locationInput =
        document.getElementById("location");

    const latitudeInput =
        document.getElementById("latitude");

    const longitudeInput =
        document.getElementById("longitude");

    const status =
        document.getElementById("locationStatus");


    if (!locationInput) {
        return;
    }


    if (!navigator.geolocation) {

        if (status) {
            status.textContent =
                "Location services are not supported by this browser.";
        }

        alert(
            "Your browser does not support GPS location."
        );

        return;
    }


    if (status) {

        status.textContent =
            "📍 Detecting your current location...";
    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            /* -----------------------------------------
               SAVE COORDINATES
               ----------------------------------------- */

            if (latitudeInput) {

                latitudeInput.value =
                    latitude;
            }

            if (longitudeInput) {

                longitudeInput.value =
                    longitude;
            }


            /* -----------------------------------------
               SHOW LOCATION IN FORM
               ----------------------------------------- */

            locationInput.value =
                "Current GPS location — " +
                latitude.toFixed(6) +
                ", " +
                longitude.toFixed(6);


            if (status) {

                status.innerHTML =
                    "✅ Current location detected successfully.";
            }

            console.log(
                "DE NOW GPS Location:",
                latitude,
                longitude
            );

        },

        function(error) {

            let message =
                "Unable to get your location.";

            if (error.code === 1) {

                message =
                    "Location permission was denied. Please allow location access.";

            } else if (error.code === 2) {

                message =
                    "Your location could not be determined.";

            } else if (error.code === 3) {

                message =
                    "Location request timed out. Please try again.";
            }


            if (status) {

                status.textContent =
                    "⚠️ " + message;
            }

            alert(message);

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );
}


/* =========================================================
   MAKE GPS FUNCTION AVAILABLE TO HTML
   ========================================================= */

window.deNowUseCurrentLocation =
    deNowUseCurrentLocation;

    /* =========================================================
   DE NOW - SOS EMERGENCY MODE
========================================================= */

function deNowStartSOS() {

    const user = getCurrentUser();

    /* -----------------------------------------
       LOGIN CHECK
       ----------------------------------------- */

    if (!user) {

        alert(
            "Please login as a customer before using DE NOW SOS."
        );

        const account =
            document.getElementById("account");

        if (account) {

            account.scrollIntoView({
                behavior: "smooth"
            });

        }

        return;
    }


    /* -----------------------------------------
       CUSTOMER CHECK
       ----------------------------------------- */

    if (user.role !== "customer") {

        alert(
            "DE NOW SOS is available to customer accounts."
        );

        return;
    }


    /* -----------------------------------------
       GET REQUEST FORM
       ----------------------------------------- */

    const problem =
        document.getElementById("problem");

    const details =
        document.getElementById("details");

    const urgency =
        document.getElementById("urgency");

    const preferredTime =
        document.getElementById("preferredTime");

    const sosStatus =
        document.getElementById("sosStatus");


    /* -----------------------------------------
       SET EMERGENCY MODE
       ----------------------------------------- */

    if (problem) {

        if (!problem.value.trim()) {

            problem.value =
                "Emergency service assistance needed";

        }

    }


    if (details) {

        if (!details.value.trim()) {

            details.value =
                "Customer requested urgent DE NOW assistance.";

        }

    }


    if (urgency) {

        urgency.value =
            "Emergency";

    }


    if (preferredTime) {

        preferredTime.value =
            "Immediately";

    }


    /* -----------------------------------------
       SHOW SOS STATUS
       ----------------------------------------- */

    if (sosStatus) {

        sosStatus.textContent =
            "🚨 Emergency mode activated. Detecting your location...";

    }


    /* -----------------------------------------
       TRY CURRENT GPS LOCATION
       ----------------------------------------- */

    if (
        typeof deNowUseCurrentLocation ===
        "function"
    ) {

        deNowUseCurrentLocation();

    }


    /* -----------------------------------------
       OPEN REQUEST FORM
       ----------------------------------------- */

    const requestSection =
        document.getElementById("request");

    if (requestSection) {

        requestSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* -----------------------------------------
       FINAL STATUS
       ----------------------------------------- */

    setTimeout(function() {

        if (sosStatus) {

            sosStatus.textContent =
                "✅ Emergency request prepared. Complete the remaining details and press Find Help.";

        }

    }, 1200);

}


/* =========================================================
   MAKE SOS AVAILABLE TO HTML
========================================================= */

window.deNowStartSOS =
    deNowStartSOS;

    /* =========================================================
   DE NOW - PROVIDER MATCHING DISPLAY
   Uses the existing provider matching engine.
========================================================= */

function deNowShowProviderMatch(requestId) {

    const panel =
        document.getElementById("providerMatchPanel");

    const title =
        document.getElementById("providerMatchTitle");

    const status =
        document.getElementById("providerMatchStatus");

    const results =
        document.getElementById("providerMatchResults");


    if (!panel || !results) {
        return;
    }


    const user = getCurrentUser();


    if (!user || user.role !== "customer") {

        return;
    }


    const request =
        getRequests().find(function(item) {

            return item.id === requestId;

        });


    if (!request) {

        return;
    }


    /* -----------------------------------------
       SHOW MATCHING PANEL
       ----------------------------------------- */

    panel.classList.remove("hidden");


    if (title) {

        title.textContent =
            "🔎 Finding a Provider...";
    }


    if (status) {

        status.textContent =
            "Checking service, availability and provider profiles...";
    }


    results.innerHTML = `
        <div class="matching-loader">

            <div class="matching-spinner"></div>

            <p>
                DE NOW is searching for available providers...
            </p>

        </div>
    `;


    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    /* -----------------------------------------
       SIMULATE MATCHING PROCESS
       ----------------------------------------- */

    setTimeout(function() {

        let providers = [];


        try {

            if (typeof findMatchingProviders === "function") {

                providers =
                    findMatchingProviders(request);

            } else {

                providers =
                    getProviders();

            }

        } catch (error) {

            console.error(
                "Provider matching error:",
                error
            );

            providers =
                getProviders();

        }


        /* -----------------------------------------
           ONLY ONLINE PROVIDERS
           ----------------------------------------- */

        providers =
            providers.filter(function(provider) {

                return provider.online !== false;

            });


        /* -----------------------------------------
           REMOVE DUPLICATES
           ----------------------------------------- */

        const seen =
            new Set();

        providers =
            providers.filter(function(provider) {

                if (!provider.id) {
                    return true;
                }

                if (seen.has(provider.id)) {

                    return false;

                }

                seen.add(provider.id);

                return true;

            });


        /* -----------------------------------------
           SORT PROVIDERS
           ----------------------------------------- */

        providers.sort(function(a, b) {

            const verifiedA =
                a.verified ? 1 : 0;

            const verifiedB =
                b.verified ? 1 : 0;

            if (verifiedB !== verifiedA) {

                return verifiedB - verifiedA;

            }


            const ratingA =
                Number(a.rating || 0);

            const ratingB =
                Number(b.rating || 0);

            if (ratingB !== ratingA) {

                return ratingB - ratingA;

            }


            const completedA =
                Number(a.completedJobs || 0);

            const completedB =
                Number(b.completedJobs || 0);

            return completedB - completedA;

        });


        /* -----------------------------------------
           NO PROVIDER FOUND
           ----------------------------------------- */

        if (providers.length === 0) {

            if (title) {

                title.textContent =
                    "⏳ No Online Provider Found Yet";

            }


            if (status) {

                status.textContent =
                    "Your request remains active. DE NOW can continue looking for an available provider.";

            }


            results.innerHTML = `

                <div class="no-provider-result">

                    <div class="matching-icon">
                        🔎
                    </div>

                    <h4>
                        We haven't found an online provider yet.
                    </h4>

                    <p>
                        Your request has already been submitted.
                        Please keep checking your notifications while
                        available providers respond.
                    </p>

                </div>

            `;

            return;
        }


        /* -----------------------------------------
           PROVIDER FOUND
           ----------------------------------------- */

        if (title) {

            title.textContent =
                "✅ Provider Matches Found";

        }


        if (status) {

            status.textContent =
                providers.length +
                (
                    providers.length === 1
                        ? " provider is"
                        : " providers are"
                ) +
                " available for this request.";

        }


        /* -----------------------------------------
           BUILD PROVIDER CARDS
           ----------------------------------------- */

        results.innerHTML = "";


        providers
            .slice(0, 5)
            .forEach(function(provider, index) {

                const card =
                    document.createElement("div");


                card.className =
                    "matched-provider-card";


                const providerName =
                    provider.name ||
                    "DE NOW Service Provider";


                const providerService =
                    provider.service ||
                    request.service ||
                    "General Service";


                const providerLocation =
                    provider.location ||
                    "Location not provided";


                const rating =
                    Number(
                        provider.rating || 0
                    ).toFixed(1);


                const reviews =
                    Number(
                        provider.reviewCount || 0
                    );


                const verified =
                    provider.verified
                        ? `
                            <span class="matched-verified">
                                ✓ DE NOW VERIFIED
                            </span>
                          `
                        : `
                            <span class="matched-unverified">
                                Verification pending
                            </span>
                          `;


                const primary =
                    index === 0
                        ? `
                            <div class="best-match-label">
                                ⭐ CURRENT BEST MATCH
                            </div>
                          `
                        : "";


                card.innerHTML = `

                    ${primary}

                    <div class="matched-provider-top">

                        <div class="matched-avatar">
                            👤
                        </div>

                        <div>

                            <h4>
                                ${deNowEscape(providerName)}
                            </h4>

                            <p>
                                <strong>
                                    ${deNowEscape(providerService)}
                                </strong>
                            </p>

                        </div>

                    </div>


                    <div class="matched-provider-info">

                        <p>
                            📍
                            ${deNowEscape(providerLocation)}
                        </p>

                        <p>
                            ⭐ ${rating}
                            (${reviews} reviews)
                        </p>

                        <p>
                            🟢 Online — accepting requests
                        </p>

                        ${verified}

                    </div>


                    <div class="matched-provider-note">

                        ${
                            index === 0
                                ? "This provider currently appears as DE NOW's first matching result."
                                : "This provider also matches your request."
                        }

                    </div>

                `;


                results.appendChild(card);

            });


        /* -----------------------------------------
           WAITING FOR PROVIDER
           ----------------------------------------- */

        const waiting =
            document.createElement("div");


        waiting.className =
            "provider-waiting-message";


        waiting.innerHTML = `

            <strong>
                ⏱️ Waiting for a provider to accept
            </strong>

            <p>
                Matching providers have been notified.
                When one accepts your request, DE NOW will update
                your booking and notifications.
            </p>

        `;


        results.appendChild(waiting);


    }, 1200);

}


/* =========================================================
   CONNECT PROVIDER MATCHING TO NEW REQUEST
========================================================= */

function deNowRunProviderMatching(requestId) {

    deNowShowProviderMatch(requestId);

}


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO HTML
========================================================= */

window.deNowShowProviderMatch =
    deNowShowProviderMatch;

window.deNowRunProviderMatching =
    deNowRunProviderMatching;

    /* =========================================================
   DE NOW - CUSTOMER PROVIDER TRACKING
   Prototype tracking layer
========================================================= */

function deNowGetActiveTrackingRequest() {

    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    if (user.role !== "customer") {
        return null;
    }

    const requests = getRequests();

    const activeRequests =
        requests.filter(function(request) {

            return (
                request.customerId === user.id &&
                request.providerId &&
                request.status !== "Completed" &&
                request.status !== "Cancelled"
            );

        });

    if (!activeRequests.length) {
        return null;
    }

    activeRequests.sort(function(a, b) {

        return (
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        );

    });

    return activeRequests[0];
}


function deNowTrackingStatusInfo(status) {

    if (status === "Accepted") {

        return {
            title: "Provider Accepted Your Request",
            message: "Your provider has accepted the job and is preparing to leave.",
            eta: "Preparing to depart",
            step: 2
        };

    }


    if (status === "On the Way") {

        return {
            title: "Your Provider Is On The Way 🚗",
            message: "Your provider has started the journey to your location.",
            eta: "Estimated arrival: 10–20 minutes",
            step: 3
        };

    }


    if (status === "Arrived") {

        return {
            title: "Your Provider Has Arrived 📍",
            message: "The provider has reached your location.",
            eta: "Provider has arrived",
            step: 4
        };

    }


    if (status === "Job Started") {

        return {
            title: "Service Is In Progress 🔧",
            message: "Your provider has started working on the problem.",
            eta: "Job currently in progress",
            step: 5
        };

    }


    return {
        title: "Request Confirmed",
        message: "Your DE NOW provider has been assigned.",
        eta: "Waiting for journey to begin",
        step: 1
    };

}


function deNowTrackingProgress(step) {

    const steps = [
        {
            number: 1,
            title: "Provider Assigned"
        },
        {
            number: 2,
            title: "Accepted"
        },
        {
            number: 3,
            title: "On The Way"
        },
        {
            number: 4,
            title: "Arrived"
        },
        {
            number: 5,
            title: "Job Started"
        }
    ];


    return steps.map(function(item) {

        const active =
            item.number <= step
                ? "tracking-step active"
                : "tracking-step";

        return `
            <div class="${active}">

                <div class="tracking-step-number">
                    ${item.number}
                </div>

                <span>
                    ${deNowEscape(item.title)}
                </span>

            </div>
        `;

    }).join("");

}


function deNowRefreshTracking() {

    const container =
        document.getElementById(
            "deNowTrackingContent"
        );

    if (!container) {
        return;
    }


    const request =
        deNowGetActiveTrackingRequest();


    /* -----------------------------------------
       NO ACTIVE REQUEST
       ----------------------------------------- */

    if (!request) {

        container.innerHTML = `

            <div class="empty-message">

                <div style="font-size:38px;">
                    📍
                </div>

                <h4>
                    No Active Provider
                </h4>

                <p>
                    A provider will appear here after accepting
                    one of your DE NOW requests.
                </p>

            </div>

        `;

        return;
    }


    const status =
        deNowTrackingStatusInfo(
            request.status
        );


    const providerName =
        request.providerName ||
        "DE NOW Provider";


    const providerService =
        request.providerService ||
        request.service ||
        "Service Provider";


    const providerLocation =
        request.providerLocation ||
        "Location not provided";


    const customerLocation =
        request.location ||
        "Your saved request location";


    container.innerHTML = `

        <div class="tracking-card">

            <div class="tracking-main-status">

                <span class="tracking-live-badge">
                    ● LIVE
                </span>

                <h3>
                    ${deNowEscape(status.title)}
                </h3>

                <p>
                    ${deNowEscape(status.message)}
                </p>

                <strong class="tracking-eta">
                    ⏱️ ${deNowEscape(status.eta)}
                </strong>

            </div>


            <div class="tracking-provider">

                <div class="tracking-provider-avatar">
                    👤
                </div>

                <div>

                    <h4>
                        ${deNowEscape(providerName)}
                    </h4>

                    <p>
                        ${deNowEscape(providerService)}
                    </p>

                </div>

            </div>


            <div class="tracking-locations">

                <div>

                    <span>📍 Provider</span>

                    <strong>
                        ${deNowEscape(providerLocation)}
                    </strong>

                </div>

                <div>

                    <span>📍 Your Location</span>

                    <strong>
                        ${deNowEscape(customerLocation)}
                    </strong>

                </div>

            </div>


            <div class="tracking-progress">

                ${deNowTrackingProgress(status.step)}

            </div>


            <div class="tracking-request-info">

                <p>
                    <strong>Service:</strong>
                    ${deNowEscape(
                        request.service ||
                        request.problem ||
                        "DE NOW Service"
                    )}
                </p>

                <p>
                    <strong>Request status:</strong>
                    ${deNowEscape(
                        request.status ||
                        "Pending"
                    )}
                </p>

            </div>


            <div class="tracking-actions">

                ${
                    request.providerId
                    ? `
                        <button
                            type="button"
                            class="action-button"
                            onclick="openChat('${request.id}')">
                            💬 Chat With Provider
                        </button>
                      `
                    : ""
                }

                <button
                    type="button"
                    class="action-button"
                    onclick="document.getElementById('bookings').scrollIntoView({behavior:'smooth'})">
                    📋 View Booking
                </button>

            </div>


            <div class="tracking-note">

                <strong>DE NOW Tracking</strong>

                <p>
                    This prototype displays the provider's current
                    service status and saved service location.
                    Real-time moving GPS and road navigation will be
                    connected in the maps stage.
                </p>

            </div>

        </div>

    `;

}


/* =========================================================
   AUTO-REFRESH TRACKING
========================================================= */

let deNowTrackingTimer = null;


function deNowStartTrackingUpdates() {

    deNowRefreshTracking();


    if (deNowTrackingTimer) {

        clearInterval(
            deNowTrackingTimer
        );

    }


    deNowTrackingTimer =
        setInterval(
            function() {

                deNowRefreshTracking();

            },
            5000
        );

}


window.deNowRefreshTracking =
    deNowRefreshTracking;

window.deNowStartTrackingUpdates =
    deNowStartTrackingUpdates;


/* =========================================================
   START TRACKING WHEN PAGE LOADS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        deNowStartTrackingUpdates();

    }
);

/* =========================================================
   DE NOW - INTERACTIVE CUSTOMER MAP
   Leaflet + OpenStreetMap
========================================================= */

let deNowCustomerMap = null;
let deNowCustomerMarker = null;
let deNowProviderMarker = null;
let deNowMapLine = null;


function deNowCreateLiveMap(request) {

    const mapElement =
        document.getElementById("deNowLiveMap");

    if (!mapElement) {
        return;
    }


    const latitude =
        Number(request.latitude);

    const longitude =
        Number(request.longitude);


    /* -----------------------------------------
       CHECK CUSTOMER GPS
       ----------------------------------------- */

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        mapElement.innerHTML = `
            <div class="map-unavailable">
                📍 Customer GPS coordinates were not recorded
                for this request.
            </div>
        `;

        return;
    }


    /* -----------------------------------------
       REMOVE OLD MAP
       ----------------------------------------- */

    if (deNowCustomerMap) {

        deNowCustomerMap.remove();

        deNowCustomerMap = null;
        deNowCustomerMarker = null;
        deNowProviderMarker = null;
        deNowMapLine = null;

    }


    /* -----------------------------------------
       CREATE MAP
       ----------------------------------------- */

    deNowCustomerMap =
        L.map("deNowLiveMap").setView(
            [latitude, longitude],
            15
        );


    /* -----------------------------------------
       OPENSTREETMAP TILES
       ----------------------------------------- */

L.tileLayer(
    "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_3y5r_1_7a1935a904989540510c0c47",
    {
        maxZoom: 20,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, ' +
            '&copy; <a href="https://carto.com/attribution/" target="_blank">CARTO</a>'
    }
).addTo(deNowCustomerMap);

    /* -----------------------------------------
       CUSTOMER MARKER
       ----------------------------------------- */

    deNowCustomerMarker =
        L.marker(
            [latitude, longitude]
        )
        .addTo(
            deNowCustomerMap
        )
        .bindPopup(
            "<strong>📍 Your Location</strong><br>DE NOW customer location."
        )
        .openPopup();


    /* -----------------------------------------
       PROVIDER GPS
       ----------------------------------------- */

    const providerLatitude =
        Number(
            request.providerLatitude
        );

    const providerLongitude =
        Number(
            request.providerLongitude
        );


    if (
        Number.isFinite(providerLatitude) &&
        Number.isFinite(providerLongitude)
    ) {

        deNowProviderMarker =
            L.marker(
                [
                    providerLatitude,
                    providerLongitude
                ]
            )
            .addTo(
                deNowCustomerMap
            )
            .bindPopup(
                "<strong>🚗 Provider</strong><br>" +
                deNowEscape(
                    request.providerName ||
                    "DE NOW Provider"
                )
            );


        /* -------------------------------------
           DRAW SIMPLE CONNECTION LINE
           ------------------------------------- */

        deNowMapLine =
            L.polyline(
                [
                    [
                        latitude,
                        longitude
                    ],
                    [
                        providerLatitude,
                        providerLongitude
                    ]
                ],
                {
                    weight: 4
                }
            ).addTo(
                deNowCustomerMap
            );


        deNowCustomerMap.fitBounds(
            [
                [
                    latitude,
                    longitude
                ],
                [
                    providerLatitude,
                    providerLongitude
                ]
            ],
            {
                padding: [30, 30]
            }
        );

    }


    /* -----------------------------------------
       MAP SIZE FIX
       ----------------------------------------- */

    setTimeout(
        function() {

            if (deNowCustomerMap) {

                deNowCustomerMap.invalidateSize();

            }

        },
        200
    );

}


/* =========================================================
   TRACKING MAP DISPLAY
========================================================= */

function deNowRefreshTrackingMap() {

    const request =
        deNowGetActiveTrackingRequest();


    const container =
        document.getElementById(
            "deNowTrackingContent"
        );


    if (!container) {
        return;
    }


    if (!request) {

        return;
    }


    const mapBox =
        document.getElementById(
            "deNowLiveMap"
        );


    if (!mapBox) {

        return;
    }


    deNowCreateLiveMap(
        request
    );

}


/* =========================================================
   CUSTOMER TRACKING WITH MAP
========================================================= */

function deNowRenderTrackingWithMap() {

    const container =
        document.getElementById(
            "deNowTrackingContent"
        );

    if (!container) {
        return;
    }


    const request =
        deNowGetActiveTrackingRequest();


    if (!request) {

        container.innerHTML = `

            <div class="empty-message">

                <div style="font-size:38px;">
                    📍
                </div>

                <h4>
                    No Active Provider
                </h4>

                <p>
                    A provider will appear here after accepting
                    one of your DE NOW requests.
                </p>

            </div>

        `;

        if (deNowCustomerMap) {

            deNowCustomerMap.remove();

            deNowCustomerMap = null;

        }

        return;
    }


    const status =
        deNowTrackingStatusInfo(
            request.status
        );


    const providerName =
        request.providerName ||
        "DE NOW Provider";


    const providerService =
        request.providerService ||
        request.service ||
        "Service Provider";


    const providerLocation =
        request.providerLocation ||
        "Location not provided";


    const customerLocation =
        request.location ||
        "GPS location";


    container.innerHTML = `

        <div class="tracking-card">

            <div class="tracking-main-status">

                <span class="tracking-live-badge">
                    ● LIVE
                </span>

                <h3>
                    ${deNowEscape(status.title)}
                </h3>

                <p>
                    ${deNowEscape(status.message)}
                </p>

                <strong class="tracking-eta">
                    ⏱️ ${deNowEscape(status.eta)}
                </strong>

            </div>


            <div class="tracking-provider">

                <div class="tracking-provider-avatar">
                    👤
                </div>

                <div>

                    <h4>
                        ${deNowEscape(providerName)}
                    </h4>

                    <p>
                        ${deNowEscape(providerService)}
                    </p>

                </div>

            </div>


            <div class="tracking-locations">

                <div>

                    <span>📍 Your Location</span>

                    <strong>
                        ${deNowEscape(customerLocation)}
                    </strong>

                </div>

                <div>

                    <span>🚗 Provider</span>

                    <strong>
                        ${deNowEscape(providerLocation)}
                    </strong>

                </div>

            </div>


            <div class="tracking-map-wrapper">

                <div
                    id="deNowLiveMap"
                    class="de-now-live-map">
                </div>

            </div>


            <div class="tracking-progress">

                ${deNowTrackingProgress(status.step)}

            </div>


            <div class="tracking-request-info">

                <p>
                    <strong>Service:</strong>
                    ${deNowEscape(
                        request.service ||
                        request.problem ||
                        "DE NOW Service"
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${deNowEscape(
                        request.status ||
                        "Pending"
                    )}
                </p>

            </div>


            <div class="tracking-actions">

                ${
                    request.providerId
                    ? `
                        <button
                            type="button"
                            class="action-button"
                            onclick="openChat('${request.id}')">
                            💬 Chat With Provider
                        </button>
                      `
                    : ""
                }

                <button
                    type="button"
                    class="action-button"
                    onclick="document.getElementById('bookings').scrollIntoView({behavior:'smooth'})">
                    📋 View Booking
                </button>

            </div>


            <div class="tracking-note">

                <strong>DE NOW Live Map</strong>

                <p>
                    Your GPS location is shown on the map.
                    Provider GPS will appear once provider
                    location sharing is connected.
                </p>

            </div>

        </div>

    `;


    deNowCreateLiveMap(
        request
    );

}


/* =========================================================
   OVERRIDE TRACKING REFRESH
========================================================= */

deNowRefreshTracking =
    function() {

        deNowRenderTrackingWithMap();

    };


window.deNowRefreshTracking =
    deNowRefreshTracking;


/* =========================================================
   INITIAL TRACKING MAP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setTimeout(
            function() {

                deNowRefreshTracking();

            },
            300
        );

    }
);

/* =========================================================
   DE NOW — SIMPLE PROVIDER GPS
   ========================================================= */

let deNowProviderGPSWatch = null;

function deNowStartProviderGPS() {

    const user = getCurrentUser();

    if (!user || user.role !== "provider") {
        alert("Please login as a provider first.");
        return;
    }

    if (!navigator.geolocation) {
        alert("GPS is not supported by this browser.");
        return;
    }

    const status =
        document.getElementById("deNowProviderGPSStatus");

    if (status) {
        status.textContent =
            "📍 Requesting your current location...";
    }

    if (deNowProviderGPSWatch !== null) {
        return;
    }

    deNowProviderGPSWatch =
        navigator.geolocation.watchPosition(

            function(position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                const accuracy =
                    position.coords.accuracy;

                /* SAVE PROVIDER LOCATION */
                const providers = getProviders();

                const provider =
                    providers.find(
                        p => p.id === user.id
                    );

                if (provider) {

                    provider.latitude =
                        latitude;

                    provider.longitude =
                        longitude;

                    provider.locationAccuracy =
                        accuracy;

                    provider.locationSharing =
                        true;

                    provider.locationUpdatedAt =
                        new Date().toISOString();

                    saveProviders(providers);
                }

                /* UPDATE ACTIVE CUSTOMER REQUESTS */
                const requests = getRequests();

                let changed = false;

                requests.forEach(function(request) {

                    if (
                        request.providerId === user.id &&
                        request.status !== "Completed" &&
                        request.status !== "Cancelled"
                    ) {

                        request.providerLatitude =
                            latitude;

                        request.providerLongitude =
                            longitude;

                        request.providerLocationAccuracy =
                            accuracy;

                        request.providerLocationSharing =
                            true;

                        request.providerLocationUpdatedAt =
                            new Date().toISOString();

                        changed = true;
                    }
                });

                if (changed) {
                    saveRequests(requests);
                }

                if (status) {

                    status.innerHTML =
                        "✅ Location sharing ON.<br>" +
                        "Latitude: " +
                        latitude.toFixed(6) +
                        "<br>" +
                        "Longitude: " +
                        longitude.toFixed(6) +
                        "<br>" +
                        "Accuracy: about " +
                        Math.round(accuracy) +
                        " metres.";
                }

                console.log(
                    "DE NOW Provider GPS:",
                    latitude,
                    longitude
                );
            },

            function(error) {

                if (status) {
                    status.textContent =
                        "⚠️ Unable to get provider GPS location.";
                }

                console.error(
                    "DE NOW Provider GPS Error:",
                    error
                );
            },

            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000
            }
        );
}


function deNowStopProviderGPS() {

    if (deNowProviderGPSWatch !== null) {

        navigator.geolocation.clearWatch(
            deNowProviderGPSWatch
        );

        deNowProviderGPSWatch = null;
    }

    const user = getCurrentUser();

    if (user && user.role === "provider") {

        const providers = getProviders();

        const provider =
            providers.find(
                p => p.id === user.id
            );

        if (provider) {

            provider.locationSharing =
                false;

            saveProviders(providers);
        }

        const requests = getRequests();

        let changed = false;

        requests.forEach(function(request) {

            if (
                request.providerId === user.id &&
                request.status !== "Completed" &&
                request.status !== "Cancelled"
            ) {

                request.providerLocationSharing =
                    false;

                changed = true;
            }
        });

        if (changed) {
            saveRequests(requests);
        }
    }

    const status =
        document.getElementById(
            "deNowProviderGPSStatus"
        );

    if (status) {
        status.textContent =
            "Location sharing is currently OFF.";
    }
}


window.deNowStartProviderGPS =
    deNowStartProviderGPS;

window.deNowStopProviderGPS =
    deNowStopProviderGPS;

    /* =========================================================
   DE NOW — CONNECT PROVIDER GPS TO CUSTOMER TRACKING MAP
   ========================================================= */

function deNowConnectProviderGPSToRequest() {

    const requests = getRequests();
    let changed = false;

    requests.forEach(function(request) {

        /* Only active requests with an assigned provider */
        if (
            !request.providerId ||
            request.status === "Completed" ||
            request.status === "Cancelled"
        ) {
            return;
        }

        /* Find the assigned provider */
        const provider =
            getProviders().find(
                p => p.id === request.providerId
            );

        if (!provider) {
            return;
        }

        /*
           If provider GPS exists, copy it to the request.
           This allows the customer tracking map to use it.
        */
        if (
            provider.latitude !== undefined &&
            provider.latitude !== null &&
            provider.longitude !== undefined &&
            provider.longitude !== null
        ) {

            if (
                provider.latitude !== "" &&
                provider.longitude !== ""
            ) {

                request.providerLatitude =
                    provider.latitude;

                request.providerLongitude =
                    provider.longitude;

                request.providerLocationAccuracy =
                    provider.locationAccuracy || 0;

                request.providerLocationSharing =
                    provider.locationSharing === true;

                request.providerLocationUpdatedAt =
                    provider.locationUpdatedAt ||
                    new Date().toISOString();

                changed = true;
            }
        }
    });

    if (changed) {
        saveRequests(requests);
    }
}


/* ---------------------------------------------------------
   CUSTOMER MAP REFRESH
   --------------------------------------------------------- */

function deNowRefreshCustomerProviderMap() {

    const user = getCurrentUser();

    if (!user || user.role !== "customer") {
        return;
    }

    /*
       Synchronize provider GPS with the active request.
    */
    if (typeof deNowConnectProviderGPSToRequest === "function") {
        deNowConnectProviderGPSToRequest();
    }

    /*
       Move the existing provider marker without
       rebuilding the map.
    */
    if (typeof deNowUpdateMovingProviderMarker === "function") {
        deNowUpdateMovingProviderMarker();
    } else {
        /*
           Create the map only if it does not exist yet.
        */
        const requests = getRequests().filter(
            request =>
                request.customerId === user.id &&
                request.providerId &&
                request.status !== "Completed" &&
                request.status !== "Cancelled"
        );

        if (requests.length > 0 && !deNowCustomerMap) {
            deNowCreateLiveMap(requests[requests.length - 1]);
        }
    }
}


/* ---------------------------------------------------------
   CONNECT TO EXISTING TRACKING REFRESH
   --------------------------------------------------------- */

const deNowOriginalTrackingRefresh =
    typeof deNowRefreshTracking === "function"
        ? deNowRefreshTracking
        : null;


function deNowRefreshTracking() {

    /*
       Keep the existing tracking system working first.
    */
    if (deNowOriginalTrackingRefresh) {

        try {
            deNowOriginalTrackingRefresh();
        } catch (error) {

            console.error(
                "DE NOW tracking refresh error:",
                error
            );
        }
    }

    /*
       Then connect provider GPS to the map.
    */
    setTimeout(
        function() {

            deNowRefreshCustomerProviderMap();

        },
        150
    );
}


/* ---------------------------------------------------------
   MAKE FUNCTION AVAILABLE TO HTML
   --------------------------------------------------------- */

window.deNowRefreshTracking =
    deNowRefreshTracking;

window.deNowRefreshCustomerProviderMap =
    deNowRefreshCustomerProviderMap;

window.deNowConnectProviderGPSToRequest =
    deNowConnectProviderGPSToRequest;


/* ---------------------------------------------------------
   AUTOMATIC CUSTOMER MAP UPDATE
   --------------------------------------------------------- */

setInterval(
    function() {

        const user = getCurrentUser();

        if (
            user &&
            user.role === "customer"
        ) {

            deNowRefreshCustomerProviderMap();
        }

    },
    5000
);

/* =========================================================
   DE NOW — AUTOMATIC PROVIDER MOVEMENT TRACKING
   ========================================================= */

let deNowProviderMovementTimer = null;


/* ---------------------------------------------------------
   CALCULATE DISTANCE BETWEEN TWO GPS POINTS
   --------------------------------------------------------- */

function deNowCalculateDistanceKm(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius = 6371;

    const dLat =
        (Number(lat2) - Number(lat1)) *
        Math.PI / 180;

    const dLon =
        (Number(lon2) - Number(lon1)) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(Number(lat1) * Math.PI / 180) *
        Math.cos(Number(lat2) * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;
}


/* ---------------------------------------------------------
   UPDATE PROVIDER MARKER WITHOUT REBUILDING THE MAP
   --------------------------------------------------------- */

function deNowUpdateMovingProviderMarker() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "customer"
    ) {
        return;
    }


    const requests =
        getRequests().filter(
            request =>
                request.customerId === user.id &&
                request.providerId &&
                request.status !== "Completed" &&
                request.status !== "Cancelled"
        );


    if (!requests.length) {
        return;
    }


    const request =
        requests[requests.length - 1];


    const providerLatitude =
        Number(request.providerLatitude);

    const providerLongitude =
        Number(request.providerLongitude);

    const customerLatitude =
        Number(request.latitude);

    const customerLongitude =
        Number(request.longitude);


    if (
        !Number.isFinite(providerLatitude) ||
        !Number.isFinite(providerLongitude)
    ) {
        return;
    }


    if (
        !Number.isFinite(customerLatitude) ||
        !Number.isFinite(customerLongitude)
    ) {
        return;
    }


    /*
       If the map does not exist yet,
       create it first.
    */

    if (
        typeof deNowCustomerMap === "undefined" ||
        !deNowCustomerMap
    ) {

        if (
            typeof deNowCreateLiveMap === "function"
        ) {

            deNowCreateLiveMap(request);
        }

        return;
    }


    const providerPoint = [
        providerLatitude,
        providerLongitude
    ];


    /* -----------------------------------------------------
       MOVE EXISTING PROVIDER MARKER
       ----------------------------------------------------- */

    if (
        typeof deNowProviderMarker !== "undefined" &&
        deNowProviderMarker
    ) {

        deNowProviderMarker.setLatLng(
            providerPoint
        );

    } else {

        /*
           Create the provider marker if it does
           not exist yet.
        */

        deNowProviderMarker =
            L.marker(
                providerPoint
            )
            .addTo(deNowCustomerMap)
            .bindPopup(
                "🚗 DE NOW Provider"
            );
    }


    /* -----------------------------------------------------
       UPDATE CUSTOMER → PROVIDER LINE
       ----------------------------------------------------- */

    const customerPoint = [
        customerLatitude,
        customerLongitude
    ];


    if (
        typeof deNowMapLine !== "undefined" &&
        deNowMapLine
    ) {

        deNowMapLine.setLatLngs([
            customerPoint,
            providerPoint
        ]);

    } else {

        deNowMapLine =
            L.polyline([
                customerPoint,
                providerPoint
            ])
            .addTo(deNowCustomerMap);
    }


    /* -----------------------------------------------------
       DISTANCE
       ----------------------------------------------------- */

    const distanceKm =
        deNowCalculateDistanceKm(
            customerLatitude,
            customerLongitude,
            providerLatitude,
            providerLongitude
        );


    /*
       Simple prototype ETA.

       Average assumed speed:
       30 km/h
    */

    const averageSpeedKmh = 30;

    const etaMinutes =
        Math.max(
            1,
            Math.ceil(
                (distanceKm / averageSpeedKmh) *
                60
            )
        );


    /* -----------------------------------------------------
       UPDATE PROVIDER POPUP
       ----------------------------------------------------- */

    if (
        typeof deNowProviderMarker !== "undefined" &&
        deNowProviderMarker
    ) {

        const providerName =
            request.providerName ||
            "DE NOW Provider";

        deNowProviderMarker.bindPopup(`
            <strong>🚗 ${deNowEscape(providerName)}</strong><br>
            Distance: ${distanceKm.toFixed(2)} km<br>
            Approx. ETA: ${etaMinutes} min<br>
            <small>GPS updated just now</small>
        `);
    }


    /* -----------------------------------------------------
       FIT MAP TO BOTH LOCATIONS
       ----------------------------------------------------- */

    try {

        const bounds =
            L.latLngBounds([
                customerPoint,
                providerPoint
            ]);

        deNowCustomerMap.fitBounds(
            bounds,
            {
                padding: [40, 40]
            }
        );

    } catch (error) {

        console.error(
            "DE NOW map bounds error:",
            error
        );
    }


    console.log(
        "DE NOW Provider Movement:",
        providerLatitude,
        providerLongitude,
        "Distance:",
        distanceKm.toFixed(2),
        "km",
        "ETA:",
        etaMinutes,
        "min"
    );
}


/* ---------------------------------------------------------
   REFRESH CUSTOMER MAP SAFELY
   --------------------------------------------------------- */

function deNowRefreshCustomerProviderMap() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "customer"
    ) {
        return;
    }


    /*
       Synchronize provider GPS with the request.
    */

    if (
        typeof deNowConnectProviderGPSToRequest ===
        "function"
    ) {

        deNowConnectProviderGPSToRequest();
    }


    /*
       Move the provider marker.
    */

    deNowUpdateMovingProviderMarker();
}


/* ---------------------------------------------------------
   START AUTOMATIC MOVEMENT REFRESH
   --------------------------------------------------------- */

function deNowStartProviderMovementTracking() {

    if (
        deNowProviderMovementTimer !== null
    ) {
        return;
    }


    deNowProviderMovementTimer =
        setInterval(
            function() {

                deNowUpdateMovingProviderMarker();

            },
            3000
        );


    console.log(
        "DE NOW automatic provider movement tracking started."
    );
}


/* ---------------------------------------------------------
   STOP AUTOMATIC MOVEMENT REFRESH
   --------------------------------------------------------- */

function deNowStopProviderMovementTracking() {

    if (
        deNowProviderMovementTimer !== null
    ) {

        clearInterval(
            deNowProviderMovementTimer
        );

        deNowProviderMovementTimer =
            null;
    }


    console.log(
        "DE NOW automatic provider movement tracking stopped."
    );
}


/* ---------------------------------------------------------
   START AFTER PAGE LOAD
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        deNowStartProviderMovementTracking();

    }
);


/* ---------------------------------------------------------
   MAKE FUNCTIONS AVAILABLE
   --------------------------------------------------------- */

window.deNowUpdateMovingProviderMarker =
    deNowUpdateMovingProviderMarker;

window.deNowStartProviderMovementTracking =
    deNowStartProviderMovementTracking;

window.deNowStopProviderMovementTracking =
    deNowStopProviderMovementTracking;

    /* =========================================================
   DE NOW — PROVIDER NAVIGATION TO CUSTOMER
   ========================================================= */

function deNowNavigateToCustomer(requestId) {

    const user = getCurrentUser();

    if (!user || user.role !== "provider") {
        alert("Please login as a provider first.");
        return;
    }

    const requests = getRequests();

    const request = requests.find(
        r =>
            r.id === requestId &&
            r.providerId === user.id
    );

    if (!request) {
        alert("This service request could not be found.");
        return;
    }

    const latitude = Number(request.latitude);
    const longitude = Number(request.longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        alert(
            "Customer GPS location is not available for this request."
        );
        return;
    }

    const destination =
        encodeURIComponent(
            latitude + "," + longitude
        );

    const googleMapsUrl =
        "https://www.google.com/maps/dir/?api=1" +
        "&destination=" +
        destination +
        "&travelmode=driving";

    window.open(
        googleMapsUrl,
        "_blank"
    );
}


/* ---------------------------------------------------------
   MAKE NAVIGATION FUNCTION AVAILABLE
   --------------------------------------------------------- */

window.deNowNavigateToCustomer =
    deNowNavigateToCustomer;

    /* =========================================================
   DE NOW — CALL CUSTOMER / CALL PROVIDER
   ========================================================= */

function deNowCallProvider(requestId) {

    const user = getCurrentUser();

    if (!user || user.role !== "customer") {
        alert("Please login as a customer first.");
        return;
    }

    const request = getRequests().find(
        r =>
            r.id === requestId &&
            r.customerId === user.id
    );

    if (!request || !request.providerId) {
        alert("No provider is assigned to this request yet.");
        return;
    }

    const provider = getProviders().find(
        p => p.id === request.providerId
    );

    const phone =
        provider && provider.phone
            ? String(provider.phone).trim()
            : "";

    if (!phone) {
        alert("The provider has not added a phone number yet.");
        return;
    }

    window.location.href =
        "tel:" + phone;
}


function deNowCallCustomer(requestId) {

    const user = getCurrentUser();

    if (!user || user.role !== "provider") {
        alert("Please login as a provider first.");
        return;
    }

    const request = getRequests().find(
        r =>
            r.id === requestId &&
            r.providerId === user.id
    );

    if (!request) {
        alert("This service request could not be found.");
        return;
    }

    const phone =
        request.contact
            ? String(request.contact).trim()
            : "";

    if (!phone) {
        alert("The customer has not provided a contact number.");
        return;
    }

    window.location.href =
        "tel:" + phone;
}


window.deNowCallProvider =
    deNowCallProvider;

window.deNowCallCustomer =
    deNowCallCustomer;

    /* =========================================================
   DE NOW — PROVIDER PROFILE DETAILS
   ========================================================= */

function deNowOpenProviderProfile(providerId) {

    const providers = getProviders();

    const provider = providers.find(
        p => p.id === providerId
    );

    if (!provider) {
        alert("Provider profile could not be found.");
        return;
    }

    const oldModal =
        document.getElementById("deNowProviderProfileModal");

    if (oldModal) {
        oldModal.remove();
    }

    const modal =
        document.createElement("div");

    modal.id =
        "deNowProviderProfileModal";

    modal.className =
        "de-now-provider-profile-modal";

    const rating =
        Number(provider.rating || 0);

    const reviews =
        Number(provider.reviewCount || 0);

    const completedJobs =
        Number(provider.completedJobs || 0);

    const experience =
        provider.experience ||
        provider.providerExperience ||
        "Not provided";

    const price =
        provider.price ||
        provider.providerPrice ||
        "Not specified";

    const phone =
        provider.phone ||
        "Not provided";

    const verified =
        provider.verified === true;

    const online =
        provider.online !== false;


    modal.innerHTML = `

        <div class="de-now-provider-profile-card">

            <button
                type="button"
                class="de-now-provider-profile-close"
                onclick="deNowCloseProviderProfile()">
                ✕
            </button>


            <div class="de-now-provider-profile-top">

                <div class="de-now-provider-profile-avatar">
                    👤
                </div>

                <div>

                    <span class="eyebrow">
                        DE NOW PROVIDER
                    </span>

                    <h2>
                        ${deNowEscape(
                            provider.name ||
                            "Service Provider"
                        )}
                    </h2>

                    <p>
                        <strong>
                            ${deNowEscape(
                                provider.service ||
                                "General Service"
                            )}
                        </strong>
                    </p>

                    <div class="de-now-provider-profile-badges">

                        <span
                            class="availability-badge ${
                                online
                                    ? "online"
                                    : "offline"
                            }">

                            ${
                                online
                                    ? "ONLINE"
                                    : "OFFLINE"
                            }

                        </span>

                        ${
                            verified
                                ? `
                                    <span class="verified-badge">
                                        ✓ DE NOW VERIFIED
                                    </span>
                                  `
                                : `
                                    <span class="pending-badge">
                                        VERIFICATION PENDING
                                    </span>
                                  `
                        }

                    </div>

                </div>

            </div>


            <div class="de-now-provider-profile-grid">

                <div class="de-now-provider-profile-item">
                    <span>⭐ Rating</span>
                    <strong>
                        ${rating.toFixed(1)} / 5
                    </strong>
                    <small>
                        ${reviews} review${
                            reviews === 1 ? "" : "s"
                        }
                    </small>
                </div>


                <div class="de-now-provider-profile-item">
                    <span>🏁 Completed Jobs</span>
                    <strong>
                        ${completedJobs}
                    </strong>
                    <small>
                        DE NOW jobs completed
                    </small>
                </div>


                <div class="de-now-provider-profile-item">
                    <span>🛠️ Experience</span>
                    <strong>
                        ${deNowEscape(
                            experience
                        )}
                    </strong>
                    <small>
                        Service experience
                    </small>
                </div>


                <div class="de-now-provider-profile-item">
                    <span>💰 Price</span>
                    <strong>
                        ${deNowEscape(
                            String(price)
                        )}
                    </strong>
                    <small>
                        Provider's stated price
                    </small>
                </div>

            </div>


            <div class="de-now-provider-profile-information">

                <p>
                    <strong>🔧 Service:</strong>
                    ${deNowEscape(
                        provider.service ||
                        "Not specified"
                    )}
                </p>

                <p>
                    <strong>📍 Service Area:</strong>
                    ${deNowEscape(
                        provider.location ||
                        "Location not provided"
                    )}
                </p>

                <p>
                    <strong>📞 Phone:</strong>
                    ${deNowEscape(phone)}
                </p>

            </div>


            <div class="de-now-provider-profile-actions">

                ${
                    phone &&
                    phone !== "Not provided"
                        ? `
                            <button
                                type="button"
                                class="action-button"
                                onclick="deNowCallProviderFromProfile('${provider.id}')">

                                📞 Call Provider

                            </button>
                          `
                        : ""
                }


                <button
                    type="button"
                    class="secondary-button"
                    onclick="deNowCloseProviderProfile()">

                    Close Profile

                </button>

            </div>

        </div>
    `;


    document.body.appendChild(modal);
}


/* ---------------------------------------------------------
   CLOSE PROFILE
   --------------------------------------------------------- */

function deNowCloseProviderProfile() {

    const modal =
        document.getElementById(
            "deNowProviderProfileModal"
        );

    if (modal) {
        modal.remove();
    }
}


/* ---------------------------------------------------------
   CALL PROVIDER FROM PROFILE
   --------------------------------------------------------- */

function deNowCallProviderFromProfile(
    providerId
) {

    const providers =
        getProviders();

    const provider =
        providers.find(
            p => p.id === providerId
        );

    if (!provider || !provider.phone) {

        alert(
            "This provider has not added a phone number."
        );

        return;
    }

    window.location.href =
        "tel:" +
        String(provider.phone).trim();
}


/* =========================================================
   CUSTOMER PROVIDER DIRECTORY
   Enhanced version with View Profile
   ========================================================= */

function showServiceProviders(service) {

    const container =
        document.getElementById(
            "providerDirectory"
        );

    const title =
        document.getElementById(
            "providerDirectoryTitle"
        );

    if (!container) {
        return;
    }


    if (title) {

        title.textContent =
            "Providers registered for: " +
            service;
    }


    const providers =
        typeof getProviders === "function"
            ? getProviders()
            : [];


    const matching =
        providers.filter(
            p =>
                deNowServiceMatches(
                    p.service,
                    service,
                    service
                )
        );


    if (!matching.length) {

        container.innerHTML = `
            <div class="empty-message">

                <strong>
                    No registered provider found yet.
                </strong>

                <p>
                    When a provider registers this
                    service, they will appear here.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        matching.map(
            p => `

                <div class="provider-card">

                    <div class="provider-avatar">
                        👤
                    </div>


                    <div class="provider-main">

                        <h4>
                            ${deNowEscape(
                                p.name ||
                                "Service Provider"
                            )}
                        </h4>

                        <p>
                            <strong>
                                ${deNowEscape(
                                    p.service ||
                                    service
                                )}
                            </strong>
                        </p>

                        <p>
                            📍 ${deNowEscape(
                                p.location ||
                                "Location not provided"
                            )}
                        </p>

                        <p>
                            ⭐ ${Number(
                                p.rating || 0
                            ).toFixed(1)}
                            (${Number(
                                p.reviewCount || 0
                            )} reviews)
                        </p>

                        <span
                            class="availability-badge ${
                                p.online === false
                                    ? "offline"
                                    : "online"
                            }">

                            ${
                                p.online === false
                                    ? "OFFLINE"
                                    : "ONLINE"
                            }

                        </span>


                        ${
                            p.verified
                                ? `
                                    <span class="verified-badge">
                                        ✓ DE NOW VERIFIED
                                    </span>
                                  `
                                : ""
                        }


                        <div
                            class="provider-profile-button-row">

                            <button
                                type="button"
                                onclick="deNowViewProviderProfile('${p.id}')"
                                style="
                                    display:inline-flex;
                                    align-items:center;
                                    justify-content:center;
                                    gap:8px;
                                    padding:10px 18px;
                                    min-width:160px;
                                    border:none;
                                    border-radius:8px;
                                    cursor:pointer;
                                    font-size:14px;
                                    font-weight:700;
                                    background:#111111;
                                    color:#ffffff;
                                    box-shadow:0 3px 8px rgba(0,0,0,0.2);
                                ">
 
                                👤 View Full Profile


                            </button>

                        </div>

                    </div>

                </div>
            `
        )
        .join("");
}


/* ---------------------------------------------------------
   MAKE FUNCTIONS AVAILABLE TO HTML
   --------------------------------------------------------- */

window.deNowOpenProviderProfile =
    deNowOpenProviderProfile;

window.deNowCloseProviderProfile =
    deNowCloseProviderProfile;

window.deNowCallProviderFromProfile =
    deNowCallProviderFromProfile;

window.showServiceProviders =
    showServiceProviders;

    /* =========================================================
   DE NOW — PROVIDER PROFILE BUTTON FIX
   ========================================================= */

function deNowViewProviderProfile(providerId) {

    const providers = getProviders();

    const provider = providers.find(
        p => String(p.id) === String(providerId)
    );

    if (!provider) {
        alert("Provider profile could not be found.");
        return;
    }

    const oldBox =
        document.getElementById(
            "deNowProviderProfileBox"
        );

    if (oldBox) {
        oldBox.remove();
    }

    const box =
        document.createElement("div");

    box.id =
        "deNowProviderProfileBox";

    box.style.position = "fixed";
    box.style.top = "0";
    box.style.left = "0";
    box.style.width = "100%";
    box.style.height = "100%";
    box.style.background = "rgba(0,0,0,0.65)";
    box.style.zIndex = "99999";
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.padding = "20px";
    box.style.boxSizing = "border-box";

    const rating =
        Number(provider.rating || 0);

    const reviews =
        Number(provider.reviewCount || 0);

    const jobs =
        Number(provider.completedJobs || 0);

    const experience =
        provider.experience ||
        provider.providerExperience ||
        "Not provided";

    const price =
        provider.price ||
        provider.providerPrice ||
        "Not specified";

    const phone =
        provider.phone ||
        "Not provided";

    box.innerHTML = `

        <div style="
            background:#fff;
            width:100%;
            max-width:600px;
            max-height:90vh;
            overflow-y:auto;
            border-radius:18px;
            padding:28px;
            box-sizing:border-box;
            position:relative;
            box-shadow:0 20px 50px rgba(0,0,0,0.3);
        ">

            <button
                type="button"
                onclick="deNowCloseProviderProfileBox()"
                style="
                    position:absolute;
                    top:12px;
                    right:12px;
                    width:38px;
                    height:38px;
                    border:none;
                    border-radius:50%;
                    cursor:pointer;
                    font-size:18px;
                ">
                ✕
            </button>

            <div style="
                display:flex;
                gap:16px;
                align-items:center;
                padding-right:40px;
            ">

                <div style="
                    width:75px;
                    height:75px;
                    border-radius:50%;
                    background:#f0f0f0;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:38px;
                ">
                    👤
                </div>

                <div>

                    <h2 style="margin:0;">
                        ${deNowEscape(
                            provider.name ||
                            "Service Provider"
                        )}
                    </h2>

                    <p style="margin:7px 0;">
                        <strong>
                            ${deNowEscape(
                                provider.service ||
                                "General Service"
                            )}
                        </strong>
                    </p>

                    <p style="margin:5px 0;">
                        📍 ${deNowEscape(
                            provider.location ||
                            "Location not provided"
                        )}
                    </p>

                </div>

            </div>

            <hr style="margin:20px 0;">

            <div style="
                display:grid;
                grid-template-columns:repeat(2,1fr);
                gap:12px;
            ">

                <div style="
                    padding:15px;
                    background:#f7f7f7;
                    border-radius:12px;
                ">
                    ⭐ Rating
                    <br>
                    <strong>
                        ${rating.toFixed(1)} / 5
                    </strong>
                    <br>
                    <small>
                        ${reviews} review${
                            reviews === 1 ? "" : "s"
                        }
                    </small>
                </div>

                <div style="
                    padding:15px;
                    background:#f7f7f7;
                    border-radius:12px;
                ">
                    🏁 Completed Jobs
                    <br>
                    <strong>
                        ${jobs}
                    </strong>
                </div>

                <div style="
                    padding:15px;
                    background:#f7f7f7;
                    border-radius:12px;
                ">
                    🛠️ Experience
                    <br>
                    <strong>
                        ${deNowEscape(
                            String(experience)
                        )}
                    </strong>
                </div>

                <div style="
                    padding:15px;
                    background:#f7f7f7;
                    border-radius:12px;
                ">
                    💰 Price
                    <br>
                    <strong>
                        ${deNowEscape(
                            String(price)
                        )}
                    </strong>
                </div>

            </div>

            <div style="
                margin-top:20px;
                padding:15px;
                background:#fafafa;
                border-radius:12px;
                line-height:1.8;
            ">

                <p>
                    <strong>🔧 Service:</strong>
                    ${deNowEscape(
                        provider.service ||
                        "Not specified"
                    )}
                </p>

                <p>
                    <strong>📍 Service Area:</strong>
                    ${deNowEscape(
                        provider.location ||
                        "Not provided"
                    )}
                </p>

                <p>
                    <strong>📞 Phone:</strong>
                    ${deNowEscape(phone)}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${
                        provider.online === false
                            ? "🔴 OFFLINE"
                            : "🟢 ONLINE"
                    }
                </p>

                <p>
                    <strong>Verification:</strong>
                    ${
                        provider.verified === true
                            ? "✅ DE NOW VERIFIED"
                            : "⏳ Verification Pending"
                    }
                </p>

            </div>

            <div style="
                display:flex;
                gap:10px;
                flex-wrap:wrap;
                margin-top:20px;
            ">

                ${
                    phone !== "Not provided"
                        ? `
                            <button
                                type="button"
                                class="action-button"
                                onclick="deNowCallProviderFromProfile('${provider.id}')">

                                📞 Call Provider

                            </button>
                          `
                        : ""
                }

                <button
                    type="button"
                    class="secondary-button"
                    onclick="deNowCloseProviderProfileBox()">

                    Close Profile

                </button>

            </div>

        </div>
    `;

    document.body.appendChild(box);
}


function deNowCloseProviderProfileBox() {

    const box =
        document.getElementById(
            "deNowProviderProfileBox"
        );

    if (box) {
        box.remove();
    }
}


window.deNowViewProviderProfile =
    deNowViewProviderProfile;

window.deNowCloseProviderProfileBox =
    deNowCloseProviderProfileBox;

    /* =========================================================
   DE NOW — PROVIDER EARNINGS DASHBOARD
   ========================================================= */

function deNowParseMoney(value) {

    if (value === null || value === undefined) {
        return 0;
    }

    const cleaned =
        String(value)
            .replace(/,/g, "")
            .replace(/[^\d.]/g, "");

    const amount = Number(cleaned);

    return Number.isFinite(amount)
        ? amount
        : 0;
}


function deNowFormatUGX(amount) {

    return "UGX " +
        Number(amount || 0).toLocaleString();
}


function deNowRenderProviderEarnings() {

    const user = getCurrentUser();

    if (!user || user.role !== "provider") {
        return;
    }

    const totalElement =
        document.getElementById("providerTotalEarnings");

    const todayElement =
        document.getElementById("providerTodayEarnings");

    const pendingElement =
        document.getElementById("providerPendingEarnings");

    const completedElement =
        document.getElementById(
            "providerEarningCompletedJobs"
        );

    const summaryElement =
        document.getElementById(
            "providerEarningsSummary"
        );

    if (
        !totalElement ||
        !todayElement ||
        !pendingElement ||
        !completedElement
    ) {
        return;
    }


    const requests =
        getRequests().filter(
            request =>
                request.providerId === user.id
        );


    /* COMPLETED JOBS */

    const completedJobs =
        requests.filter(
            request =>
                request.status === "Completed"
        );


    /* ACTIVE / PENDING JOBS */

    const pendingJobs =
        requests.filter(
            request =>
                request.status !== "Completed" &&
                request.status !== "Cancelled"
        );


    /* TOTAL EARNINGS */

    const totalEarnings =
        completedJobs.reduce(
            (total, request) =>
                total +
                deNowParseMoney(
                    request.estimatedPrice
                ),
            0
        );


    /* TODAY'S EARNINGS */

    const now = new Date();

    const todayEarnings =
        completedJobs
            .filter(request => {

                if (!request.createdAt) {
                    return false;
                }

                const date =
                    new Date(request.createdAt);

                return (
                    date.getFullYear() ===
                        now.getFullYear() &&
                    date.getMonth() ===
                        now.getMonth() &&
                    date.getDate() ===
                        now.getDate()
                );
            })
            .reduce(
                (total, request) =>
                    total +
                    deNowParseMoney(
                        request.estimatedPrice
                    ),
                0
            );


    /* PENDING EARNINGS */

    const pendingEarnings =
        pendingJobs.reduce(
            (total, request) =>
                total +
                deNowParseMoney(
                    request.estimatedPrice
                ),
            0
        );


    /* UPDATE CARDS */

    totalElement.textContent =
        deNowFormatUGX(totalEarnings);

    todayElement.textContent =
        deNowFormatUGX(todayEarnings);

    pendingElement.textContent =
        deNowFormatUGX(pendingEarnings);

    completedElement.textContent =
        completedJobs.length;


    /* PROVIDER FEES */

    let payments = [];

    try {

        payments =
            JSON.parse(
                localStorage.getItem(
                    "deNowPayments"
                ) || "[]"
            );

    } catch (error) {

        payments = [];
    }


    const providerFees =
        payments.filter(
            payment =>
                payment.userId === user.id &&
                payment.type === "provider"
        );


    const totalProviderFees =
        providerFees.reduce(
            (total, payment) =>
                total +
                Number(payment.amount || 0),
            0
        );


    /* SUMMARY */

    if (summaryElement) {

        summaryElement.innerHTML = `

            <div class="earnings-summary-row">
                <span>Completed service value</span>
                <strong>
                    ${deNowFormatUGX(totalEarnings)}
                </strong>
            </div>

            <div class="earnings-summary-row">
                <span>Pending service value</span>
                <strong>
                    ${deNowFormatUGX(pendingEarnings)}
                </strong>
            </div>

            <div class="earnings-summary-row">
                <span>DE NOW provider fees paid</span>
                <strong>
                    ${deNowFormatUGX(totalProviderFees)}
                </strong>
            </div>

            <small class="earnings-note">
                Earnings shown here are based on the
                recorded service price of completed jobs.
            </small>

        `;
    }
}


/* AUTOMATIC REFRESH */

setInterval(
    function() {
        deNowRenderProviderEarnings();
    },
    3000
);


document.addEventListener(
    "DOMContentLoaded",
    function() {

        deNowRenderProviderEarnings();

    }
);


window.deNowRenderProviderEarnings =
    deNowRenderProviderEarnings;

    /* =========================================================
   DE NOW — PROVIDER JOB HISTORY
   ========================================================= */

let deNowProviderHistoryFilter = "all";


function deNowFilterProviderHistory(
    filter
) {

    deNowProviderHistoryFilter =
        filter || "all";

    document
        .querySelectorAll(
            ".history-filter-button"
        )
        .forEach(
            button => {
                button.classList.remove("active");
            }
        );

    const buttons =
        document.querySelectorAll(
            ".history-filter-button"
        );

    buttons.forEach(
        button => {

            const text =
                button.textContent
                    .trim()
                    .toLowerCase();

            if (
                (filter === "all" && text === "all") ||
                (filter === "active" && text === "active") ||
                (filter === "completed" && text === "completed") ||
                (filter === "cancelled" && text === "cancelled")
            ) {

                button.classList.add("active");
            }
        }
    );

    deNowRenderProviderJobHistory();
}


/* ---------------------------------------------------------
   RENDER PROVIDER JOB HISTORY
   --------------------------------------------------------- */

function deNowRenderProviderJobHistory() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "provider"
    ) {
        return;
    }

    const list =
        document.getElementById(
            "providerJobHistoryList"
        );

    if (!list) {
        return;
    }


    const allJobs =
        getRequests().filter(
            request =>
                request.providerId === user.id
        );


    const completed =
        allJobs.filter(
            request =>
                request.status === "Completed"
        );


    const cancelled =
        allJobs.filter(
            request =>
                request.status === "Cancelled"
        );


    const active =
        allJobs.filter(
            request =>
                request.status !== "Completed" &&
                request.status !== "Cancelled"
        );


    /* SUMMARY */

    const totalElement =
        document.getElementById(
            "providerHistoryTotal"
        );

    const completedElement =
        document.getElementById(
            "providerHistoryCompleted"
        );

    const activeElement =
        document.getElementById(
            "providerHistoryActive"
        );

    const cancelledElement =
        document.getElementById(
            "providerHistoryCancelled"
        );


    if (totalElement) {
        totalElement.textContent =
            allJobs.length;
    }

    if (completedElement) {
        completedElement.textContent =
            completed.length;
    }

    if (activeElement) {
        activeElement.textContent =
            active.length;
    }

    if (cancelledElement) {
        cancelledElement.textContent =
            cancelled.length;
    }


    /* FILTER */

    let jobs =
        allJobs.slice().reverse();


    if (
        deNowProviderHistoryFilter ===
        "active"
    ) {

        jobs = active.slice().reverse();

    } else if (
        deNowProviderHistoryFilter ===
        "completed"
    ) {

        jobs = completed.slice().reverse();

    } else if (
        deNowProviderHistoryFilter ===
        "cancelled"
    ) {

        jobs = cancelled.slice().reverse();
    }


    if (!jobs.length) {

        list.innerHTML = `
            <div class="empty-message">

                No ${
                    deNowProviderHistoryFilter === "all"
                        ? ""
                        : deNowProviderHistoryFilter + " "
                }jobs found.

            </div>
        `;

        return;
    }


    list.innerHTML =
        jobs.map(
            request => {

                const amount =
                    deNowParseMoney(
                        request.estimatedPrice
                    );


                let statusClass =
                    "history-status-active";


                if (
                    request.status ===
                    "Completed"
                ) {

                    statusClass =
                        "history-status-completed";

                } else if (
                    request.status ===
                    "Cancelled"
                ) {

                    statusClass =
                        "history-status-cancelled";
                }


                const dateText =
                    request.createdAt
                        ? new Date(
                            request.createdAt
                        ).toLocaleString()
                        : "Date not available";


                return `

                    <div class="provider-job-history-card">

                        <div class="provider-job-history-top">

                            <div>

                                <h4>
                                    ${deNowEscape(
                                        request.service ||
                                        request.problem ||
                                        "Service Job"
                                    )}
                                </h4>

                                <span class="
                                    history-status-badge
                                    ${statusClass}
                                ">

                                    ${deNowEscape(
                                        request.status ||
                                        "Pending"
                                    )}

                                </span>

                            </div>

                            <strong class="history-job-amount">
                                ${deNowFormatUGX(amount)}
                            </strong>

                        </div>


                        <div class="provider-job-history-details">

                            <p>
                                <strong>👤 Customer:</strong>
                                ${deNowEscape(
                                    request.customerName ||
                                    "Not provided"
                                )}
                            </p>

                            <p>
                                <strong>🔧 Service:</strong>
                                ${deNowEscape(
                                    request.service ||
                                    "General Service"
                                )}
                            </p>

                            <p>
                                <strong>📝 Problem:</strong>
                                ${deNowEscape(
                                    request.problem ||
                                    "Not specified"
                                )}
                            </p>

                            <p>
                                <strong>📍 Location:</strong>
                                ${deNowEscape(
                                    request.location ||
                                    "Not provided"
                                )}
                            </p>

                            <p>
                                <strong>📅 Date:</strong>
                                ${deNowEscape(
                                    dateText
                                )}
                            </p>

                        </div>


                        ${
                            request.status !== "Completed" &&
                            request.status !== "Cancelled"
                                ? `
                                    <div class="provider-job-history-action">

                                        <button
                                            type="button"
                                            class="action-button"
                                            onclick="openChat('${request.id}')">

                                            💬 Open Chat

                                        </button>

                                    </div>
                                  `
                                : ""
                        }

                    </div>

                `;
            }
        )
        .join("");
}


/* ---------------------------------------------------------
   AUTOMATIC REFRESH
   --------------------------------------------------------- */

setInterval(
    function() {

        deNowRenderProviderJobHistory();

    },
    3000
);


/* ---------------------------------------------------------
   INITIAL LOAD
   --------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        deNowRenderProviderJobHistory();

    }
);


window.deNowFilterProviderHistory =
    deNowFilterProviderHistory;

window.deNowRenderProviderJobHistory =
    deNowRenderProviderJobHistory;

    /* =========================================================
   DE NOW — PROVIDER PERFORMANCE DASHBOARD
   ========================================================= */

function deNowRenderProviderPerformance() {

    const user = getCurrentUser();

    if (
        !user ||
        user.role !== "provider"
    ) {
        return;
    }

    const ratingElement =
        document.getElementById(
            "providerPerformanceRating"
        );

    const reviewsElement =
        document.getElementById(
            "providerPerformanceReviews"
        );

    const completedElement =
        document.getElementById(
            "providerPerformanceCompleted"
        );

    const activeElement =
        document.getElementById(
            "providerPerformanceActive"
        );

    const completionRateElement =
        document.getElementById(
            "providerPerformanceCompletionRate"
        );

    const messageElement =
        document.getElementById(
            "providerPerformanceMessage"
        );


    if (
        !ratingElement ||
        !reviewsElement ||
        !completedElement ||
        !activeElement ||
        !completionRateElement
    ) {
        return;
    }


    /* -----------------------------------------------------
       GET PROVIDER PROFILE
    ----------------------------------------------------- */

    const providers =
        getProviders();

    const provider =
        providers.find(
            p => p.id === user.id
        );


    /* -----------------------------------------------------
       GET PROVIDER JOBS
    ----------------------------------------------------- */

    const allJobs =
        getRequests().filter(
            request =>
                request.providerId === user.id
        );


    const completedJobs =
        allJobs.filter(
            request =>
                request.status === "Completed"
        );


    const cancelledJobs =
        allJobs.filter(
            request =>
                request.status === "Cancelled"
        );


    const activeJobs =
        allJobs.filter(
            request =>
                request.status !== "Completed" &&
                request.status !== "Cancelled"
        );


    /* -----------------------------------------------------
       RATING
    ----------------------------------------------------- */

    const rating =
        provider
            ? Number(provider.rating || 0)
            : 0;


    const reviewCount =
        provider
            ? Number(provider.reviewCount || 0)
            : 0;


    /* -----------------------------------------------------
       COMPLETION RATE
       
       Cancelled jobs are excluded from successful jobs,
       so the calculation is:

       Completed ÷ (Completed + Cancelled)
    ----------------------------------------------------- */

    const finishedJobs =
        completedJobs.length +
        cancelledJobs.length;


    let completionRate = 0;


    if (finishedJobs > 0) {

        completionRate =
            Math.round(
                (
                    completedJobs.length /
                    finishedJobs
                ) * 100
            );

    } else if (allJobs.length > 0) {

        completionRate = 0;

    }


    /* -----------------------------------------------------
       UPDATE PERFORMANCE CARDS
    ----------------------------------------------------- */

    ratingElement.textContent =
        rating.toFixed(1) +
        " / 5";


    reviewsElement.textContent =
        reviewCount;


    completedElement.textContent =
        completedJobs.length;


    activeElement.textContent =
        activeJobs.length;


    completionRateElement.textContent =
        completionRate +
        "%";


    /* -----------------------------------------------------
       PERFORMANCE MESSAGE
    ----------------------------------------------------- */

    if (messageElement) {

        let message =
            "Keep providing reliable service to build your DE NOW reputation.";

        if (
            rating >= 4.5 &&
            completionRate >= 90
        ) {

            message =
                "🏆 Excellent performance. Customers can see that you are a highly reliable provider.";

        } else if (
            rating >= 4 &&
            completionRate >= 80
        ) {

            message =
                "👏 Good performance. Keep maintaining your service quality.";

        } else if (
            completedJobs.length === 0
        ) {

            message =
                "Complete your first DE NOW job to start building your performance record.";

        } else if (
            completionRate < 80
        ) {

            message =
                "Focus on completing accepted jobs successfully to improve your completion rate.";
        }


        messageElement.textContent =
            message;
    }


    console.log(
        "DE NOW Provider Performance:",
        {
            rating,
            reviewCount,
            completedJobs:
                completedJobs.length,
            activeJobs:
                activeJobs.length,
            cancelledJobs:
                cancelledJobs.length,
            completionRate
        }
    );
}


/* ---------------------------------------------------------
   AUTOMATIC REFRESH
--------------------------------------------------------- */

setInterval(
    function() {

        deNowRenderProviderPerformance();

    },
    3000
);


/* ---------------------------------------------------------
   INITIAL LOAD
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        deNowRenderProviderPerformance();

    }
);


/* ---------------------------------------------------------
   EXPOSE FUNCTION
--------------------------------------------------------- */

window.deNowRenderProviderPerformance =
    deNowRenderProviderPerformance;

    /* =========================================================
   DE NOW PROVIDER VERIFICATION CENTER
   ========================================================= */

function deNowSubmitVerification() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "provider"
    ) {

        alert(
            "Please login as a provider."
        );

        return;
    }


    const fullName =
    document.getElementById(
        "verificationFullName"
    )
        ? document.getElementById(
            "verificationFullName"
        ).value.trim()
        : "";

    const phone =
    document.getElementById(
        "verificationPhone"
    )
        ? document.getElementById(
            "verificationPhone"
        ).value.trim()
        : "";

    const service =
    document.getElementById(
        "verificationService"
    )
        ? document.getElementById(
            "verificationService"
        ).value.trim()
        : "";

    const location =
    document.getElementById(
        "verificationLocation"
    )
        ? document.getElementById(
            "verificationLocation"
        ).value.trim()
        : "";

    const experience =
    document.getElementById(
        "verificationExperience"
    )
        ? document.getElementById(
            "verificationExperience"
        ).value.trim()
        : "";

    const details =
    document.getElementById(
        "verificationDetails"
    )
        ? document.getElementById(
            "verificationDetails"
        ).value.trim()
        : "";


    if (
        !fullName ||
        !phone ||
        !service ||
        !location ||
        !experience ||
        !details
    ) {

        alert(
            "Please complete all verification fields before submitting."
        );

        return;
    }


    const providers =
        getProviders();

    const provider =
        providers.find(
            item =>
                item.id === user.id
        );


    if (!provider) {

        alert(
            "Provider profile could not be found."
        );

        return;
    }


    provider.verificationStatus =
        "Pending Verification";

    provider.verified =
        false;

    provider.verificationData = {

        fullName:
            fullName,

        phone:
            phone,

        service:
            service,

        location:
            location,

        experience:
            experience,

        details:
            details,

        submittedAt:
            new Date().toISOString()
    };


    saveProviders(
        providers
    );


    const statusCard =
        document.getElementById(
            "providerVerificationStatus"
        );

    if (statusCard) {

        statusCard.innerHTML =
            "⏳ <strong>Pending Verification</strong>";
    }


    const centerStatus =
        document.getElementById(
            "providerVerificationCenterStatus"
        );

    if (centerStatus) {

        centerStatus.innerHTML =
            "⏳ Pending Verification";
    }


    const message =
        document.getElementById(
            "providerVerificationMessage"
        );

    if (message) {

        message.innerHTML =
            "✅ Your verification information has been submitted successfully. DE NOW will review your information.";

    }


    alert(
        "Verification submitted successfully."
    );
}


/* =========================================================
   LOAD PROVIDER VERIFICATION STATUS
   ========================================================= */

function deNowRenderProviderVerification() {

    const user =
        getCurrentUser();

    if (
        !user ||
        user.role !== "provider"
    ) {

        return;
    }


    const providers =
        getProviders();

    const provider =
        providers.find(
            item =>
                item.id === user.id
        );


    if (!provider) {

        return;
    }


    const status =
        provider.verificationStatus ||
        (
            provider.verified === true
                ? "Verified"
                : "Not Verified"
        );


    const dashboardStatus =
        document.getElementById(
            "providerVerificationStatus"
        );

    if (dashboardStatus) {

        if (
            status === "Verified"
        ) {

            dashboardStatus.innerHTML =
                "✅ <strong>Verified Provider</strong>";

        } else if (
            status === "Pending Verification"
        ) {

            dashboardStatus.innerHTML =
                "⏳ <strong>Pending Verification</strong>";

        } else {

            dashboardStatus.innerHTML =
                "❌ <strong>Not Verified</strong>";
        }
    }


    const centerStatus =
        document.getElementById(
            "providerVerificationCenterStatus"
        );

    if (centerStatus) {

        if (
            status === "Verified"
        ) {

            centerStatus.innerHTML =
                "✅ Verified Provider";

        } else if (
            status === "Pending Verification"
        ) {

            centerStatus.innerHTML =
                "⏳ Pending Verification";

        } else {

            centerStatus.innerHTML =
                "❌ Not Verified";
        }
    }
}


/* =========================================================
   EXPOSE VERIFICATION FUNCTIONS
   ========================================================= */

window.deNowSubmitVerification =
    deNowSubmitVerification;

window.deNowRenderProviderVerification =
    deNowRenderProviderVerification;