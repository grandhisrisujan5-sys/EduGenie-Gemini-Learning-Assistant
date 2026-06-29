// ======================================
// EduGenie AI
// Part 1
// ======================================

const task = document.getElementById("task");
const inputText = document.getElementById("inputText");
const generateBtn = document.getElementById("generateBtn");
const output = document.getElementById("output");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const pdfBtnUpload = document.getElementById("pdfBtnUpload");
const pdfInput = document.getElementById("pdfInput");
const pdfPreview = document.getElementById("pdfPreview");

let selectedPDF = null;

let selectedImage = null;



let latestResponse = "";

generateBtn.addEventListener("click", generateResponse);

async function generateResponse() {

    const selectedTask = task.value;
    const userInput = inputText.value.trim();

    if (userInput === "") {

        alert("Please enter your question.");

        inputText.focus();

        return;

    }

    // ==========================
    // Save Recent Search
    // ==========================

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.unshift(userInput);

    history = history.slice(0,5);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    loadHistory();

    // ==========================
    // Select API
    // ==========================

    let endpoint = "";

    switch(selectedTask){

        case "qa":
            endpoint="/qa";
            break;

        case "explain":
            endpoint="/explain";
            break;

        case "summary":
            endpoint="/summary";
            break;

        case "quiz":
            endpoint="/quiz";
            break;

        case "learning":
            endpoint="/learning";
            break;

    }

    // ==========================
    // Disable Button
    // ==========================

    generateBtn.disabled = true;

    generateBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Generating...
    `;

    // ==========================
    // Chat Window
    // ==========================

    const chatContainer =
        document.getElementById("chatContainer");
        if (!chatContainer) {

    console.error("chatContainer not found!");

    return;

}

    // Remove welcome card

    const welcome =
        document.querySelector(".welcome-card");

    if(welcome){

        welcome.remove();

    }

    // ==========================
    // USER MESSAGE
    // ==========================

    const userBubble =
        document.createElement("div");

    userBubble.className =
        "chat-message user-message";

    userBubble.innerHTML = `
        <strong>👤 You</strong>

        <span style="float:right;font-size:12px;opacity:.7;">

        ${getCurrentTime()}

        </span>
        <br><br>
        ${userInput}
    `;

    chatContainer.appendChild(userBubble);

    // ==========================
    // Loading Bubble
    // ==========================

    const loading =
        document.createElement("div");

    loading.className =
        "chat-message ai-message";

    loading.innerHTML = `
        🤖 EduGenie AI

        <br><br>

        <div class="loading-container">

            <div class="loader"></div>

            <p>
            Thinking...
            </p>

        </div>
    `;

    chatContainer.appendChild(loading);

    loading.scrollIntoView({

        behavior:"smooth"

    });

    try{

let response;

if (selectedImage) {

    const formData = new FormData();

    formData.append("image", selectedImage);
    formData.append("prompt", userInput);

    response = await fetch("/image", {
        method: "POST",
        body: formData
    });

} else {

    response = await fetch(endpoint, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            text: userInput
        })

    });

}

        if(!response.ok){

            throw new Error(
                "Server Error"
            );

        }

        const data =
            await response.json();

        latestResponse =
            data.response;


        // Remove loading bubble

        loading.remove();

        // ======================
        // AI Bubble
        // ======================
        const aiBubble =
        document.createElement("div");

        aiBubble.className =
        "chat-message ai-message";

            aiBubble.innerHTML = `
            <strong>🤖 EduGenie AI</strong>

        <span style="float:right;font-size:12px;opacity:.7;">

        ${getCurrentTime()}

        </span>

        <br><br>

    ${data.response}
`;

chatContainer.appendChild(aiBubble);
        
        

        chatContainer.appendChild(aiBubble);

        aiBubble.scrollIntoView({

            behavior:"smooth"

        });

        document
        .getElementById("copyBtn")
        .style.display="inline-flex";

        document.getElementById("speakBtn").style.display="inline-flex";

        document
        .getElementById("pdfBtn")
        .style.display="inline-flex";

    }

    catch(error){

        loading.remove();

        const errorBubble =
            document.createElement("div");

        errorBubble.className =
            "chat-message ai-message";

        errorBubble.innerHTML=`

        ❌ ${error.message}

        `;

        chatContainer.appendChild(
            errorBubble
        );

    }

    finally{

        generateBtn.disabled=false;

        generateBtn.innerHTML=`

        <i class="fa-solid fa-wand-magic-sparkles"></i>

        Generate

        `;

    }

}
// ======================================
// Copy Latest AI Response
// ======================================

async function copyResponse() {

    if (latestResponse === "") {

        alert("Generate a response first.");

        return;

    }

    const temp = document.createElement("div");

    temp.innerHTML = latestResponse;

    const text = temp.innerText;

    try {

        await navigator.clipboard.writeText(text);

        const btn = document.getElementById("copyBtn");

        btn.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Copied!
        `;

        btn.style.background = "#22c55e";
        btn.style.color = "#fff";

        setTimeout(() => {

            btn.innerHTML = `
                <i class="fa-regular fa-copy"></i>
                Copy
            `;

            btn.style.background = "#FFD54F";
            btn.style.color = "#222";

        }, 2000);

    }

    catch {

        alert("Clipboard not supported.");

    }

}

// ======================================
// Download PDF
// ======================================

function downloadPDF() {

    if (latestResponse === "") {

        alert("Generate a response first.");

        return;

    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const temp = document.createElement("div");

    temp.innerHTML = latestResponse;

    const text = temp.innerText;

    const lines = doc.splitTextToSize(text, 180);

    doc.setFont("helvetica");

    doc.setFontSize(12);

    doc.text(lines, 10, 15);

    doc.save("EduGenie_Response.pdf");

}

// ======================================
// Feature Cards
// ======================================

document.querySelectorAll(".feature-card").forEach(card => {

    card.addEventListener("click", () => {

        task.value = card.dataset.task;

        inputText.focus();

    });

});

// ======================================
// Recent Searches
// ======================================

function loadHistory() {

    const history =
        JSON.parse(localStorage.getItem("history")) || [];

    const historyList =
        document.getElementById("historyList");

    if (!historyList) return;

    historyList.innerHTML = "";

    history.forEach(item => {

        const li = document.createElement("li");

        li.textContent = item;

        li.onclick = () => {

            inputText.value = item;

            inputText.focus();

        };

        historyList.appendChild(li);

    });

}

loadHistory();

// ======================================
// AI Typing Animation
// ======================================

async function typeWriter(element, text, speed = 15) {

    element.innerHTML = "";

    let i = 0;

    while (i < text.length) {

        element.innerHTML += text.charAt(i);

        i++;

        await new Promise(resolve => setTimeout(resolve, speed));

    }

}

function getCurrentTime(){

    return new Date().toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

}

// ======================================
// Voice Input
// ======================================

const voiceBtn = document.getElementById("voiceBtn");

if ("webkitSpeechRecognition" in window) {

    const recognition = new webkitSpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-US";

    voiceBtn.addEventListener("click", () => {

        recognition.start();

        voiceBtn.innerHTML = `
            <i class="fa-solid fa-microphone-lines"></i>
        `;

    });

    recognition.onresult = (event) => {

        inputText.value =
            event.results[0][0].transcript;

    };

    recognition.onend = () => {

        voiceBtn.innerHTML = `
            <i class="fa-solid fa-microphone"></i>
        `;

    };

}
else{

    voiceBtn.style.display = "none";

}

// ======================================
// Speak / Stop AI Response
// ======================================

let isSpeaking = false;

function speakResponse() {

    const btn = document.getElementById("speakBtn");

    // If already speaking, stop it
    if (speechSynthesis.speaking) {

        speechSynthesis.cancel();

        isSpeaking = false;

        btn.innerHTML = `
            <i class="fa-solid fa-volume-high"></i>
            Speak
        `;

        return;
    }

    if (!latestResponse) {

        alert("Generate a response first.");

        return;
    }

    const temp = document.createElement("div");

    temp.innerHTML = latestResponse;

    const text = temp.innerText;

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    isSpeaking = true;

    btn.innerHTML = `
        <i class="fa-solid fa-stop"></i>
        Stop
    `;

    speech.onend = () => {

        isSpeaking = false;

        btn.innerHTML = `
            <i class="fa-solid fa-volume-high"></i>
            Speak
        `;
    };

    speech.onerror = () => {

        isSpeaking = false;

        btn.innerHTML = `
            <i class="fa-solid fa-volume-high"></i>
            Speak
        `;
    };

    speechSynthesis.speak(speech);

}

// -----------------------------
// Image Upload
// -----------------------------

imageBtn.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    selectedImage = file;

    imagePreview.innerHTML = `
        <img
            src="${URL.createObjectURL(file)}"
            style="
                width:220px;
                margin-top:15px;
                border-radius:12px;
                box-shadow:0 0 15px rgba(0,0,0,0.25);
            "
        >
    `;

});

// ------------------------------------
// PDF Upload
// ------------------------------------

pdfBtnUpload.addEventListener("click", () => {
    pdfInput.click();
});

pdfInput.addEventListener("change", () => {

    const file = pdfInput.files[0];

    if (!file) return;

    selectedPDF = file;

    pdfPreview.innerHTML = `
        <div style="
            margin-top:15px;
            padding:12px;
            border-radius:10px;
            background:rgba(255,255,255,.15);
            color:white;
            font-weight:600;
        ">
            📄 ${file.name}
        </div>
    `;
});

// =======================================
// Theme Toggle
// =======================================

const themeBtn = document.getElementById("themeBtn");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.innerHTML = "☀️";
} else {
    themeBtn.innerHTML = "🌙";
}

// Toggle theme
themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
        themeBtn.innerHTML = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        themeBtn.innerHTML = "🌙";
    }

});

