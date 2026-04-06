const form = document.querySelector("#edit-inventory-form")
console.log("Form found:", form) // Check if form exists

if (form) {
    form.addEventListener("change", function() {
        console.log("Change event fired") // Check if event fires
        const updateBtn = form.querySelector("button[type='submit']")
        console.log("Button found:", updateBtn) // Check if button exists
        if (updateBtn) {
            updateBtn.removeAttribute("disabled")
            console.log("Disabled removed") // Confirm it worked
        }
    })
} else {
    console.log("Form not found!")
}