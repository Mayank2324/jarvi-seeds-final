// ===============================
// Jarvi Seeds Admin Login
// ===============================

async function login() {

    const adminKey = document.getElementById("adminKey").value.trim();

    if (!adminKey) {

        document.getElementById("message").innerHTML =
            "Please enter Admin Password.";

        return;
    }

    try {

        const response = await fetch("/api/admin/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                adminKey
            })

        });

        const data = await response.json();

        if (data.success) {

            // Save Login
            localStorage.setItem("adminLoggedIn", "true");
            localStorage.setItem("adminKey", adminKey);

            // Redirect
            window.location.href = "admin-dashboard.html";

        } else {

            document.getElementById("message").innerHTML =
                data.message;

        }

    } catch (err) {

        console.error(err);

        document.getElementById("message").innerHTML =
            "Unable to connect to server.";

    }

}
