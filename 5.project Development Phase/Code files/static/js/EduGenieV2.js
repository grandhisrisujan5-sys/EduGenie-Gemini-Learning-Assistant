// ======================================
// EduGenie AI V2 (Fully Fixed & Optimized)
// Part 1
// ======================================

// ==============================
// DOM Elements
// ==============================
const task = document.getElementById("task");
const inputText = document.getElementById("inputText");
const generateBtn = document.getElementById("generateBtn");

const output = document.getElementById("output");
const chatContainer = document.getElementById("chatContainer");

const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

const pdfBtnUpload = document.getElementById("pdfBtnUpload");
const pdfInput = document.getElementById("pdfInput");
const pdfPreview = document.getElementById("pdfPreview");

const historyList = document.getElementById("historyList");

const copyBtn = document.getElementById("copyBtn");
const speakBtn = document.getElementById("speakBtn");
const pdfBtn = document.getElementById("pdfBtn");
const newChatBtn = document.getElementById("newChatBtn");
const themeBtn = document.getElementById("themeBtn");
const historyToggle =
document.getElementById("historyToggle");

const historyContainer =
document.getElementById("historyContainer");

const historyArrow =
document.getElementById("historyArrow");


// ==============================
// Global Variables
// ==============================
let selectedImage = null;
let selectedPDF = null;
let latestResponse = "";

// Chat Memory (Future Ready & Fully Synced)
let currentConversation = [];

// ==============================
// Event Listeners & Initialization
// ==============================
if (generateBtn) {
    generateBtn.addEventListener("click", generateResponse);
}
if (copyBtn) {
    copyBtn.addEventListener("click", copyResponse);
}
if (speakBtn) {
    speakBtn.addEventListener("click", speakResponse);
}
if (pdfBtn) {
    pdfBtn.addEventListener("click", downloadPDF);
}

// Initialize components
initialiseVoice();
initialiseUploads();
initialiseTheme();
loadHistory();

// ==============================
// Main AI Function
// ==============================
async function generateResponse() {
    const selectedTask = task.value;
    const userInput = inputText.value.trim();

    if (!userInput) {
        alert("Please enter your question.");
        inputText.focus();
        return;
    }

    // ==========================
    // API Endpoint
    // ==========================
    const endpointMap = {
        qa: "/qa",
        explain: "/explain",
        summary: "/summary",
        quiz: "/quiz",
        learning: "/learning"
    };

    const endpoint = endpointMap[selectedTask];

    // ==========================
    // Generate Button Loading State
    // ==========================
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Generating...
    `;

    // ==========================
    // Chat Window Guard
    // ==========================
    if (!chatContainer) {
        console.error("Chat container not found.");
        generateBtn.disabled = false;
        return;
    }

    // Remove Welcome Card
    const welcome = document.querySelector(".welcome-card");
    if (welcome) {
        welcome.remove();
    }

    // ==========================
    // USER MESSAGE
    // ==========================
    const userBubble = document.createElement("div");
    userBubble.className = "chat-message user-message";
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
    const loading = document.createElement("div");
    loading.className = "chat-message ai-message";
    loading.innerHTML = `
        🤖 EduGenie AI
        <br><br>
        <div class="loading-container">
            <div class="loader"></div>
            <p>Thinking...</p>
        </div>
    `;
    chatContainer.appendChild(loading);
    loading.scrollIntoView({ behavior: "smooth" });

    // ==========================
    // Send Request
    // ==========================
    try {
        let response;

        // --------------------------
        // Image Analysis
        // --------------------------
        if (selectedImage) {
            const formData = new FormData();
            formData.append("image", selectedImage);
            formData.append("prompt", userInput);

            response = await fetch("/image", {
                method: "POST",
                body: formData
            });
        }
        // --------------------------
        // PDF Analysis
        // --------------------------
        else if (selectedPDF) {
            const formData = new FormData();
            formData.append("pdf", selectedPDF);
            formData.append("prompt", userInput);

            response = await fetch("/pdf", {
                method: "POST",
                body: formData
            });
        }
        // --------------------------
        // Normal AI Request
        // --------------------------
        else {
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

        if (!response.ok) {
            throw new Error("Server Error");
        }

        const data = await response.json();
        latestResponse = data.response;

        // ==========================
        // Remove Loading Bubble
        // ==========================
        loading.remove();

        // ==========================
        // Save Conversation Context
        // ==========================
        currentConversation.push({
            role: "user",
            message: userInput,
            time: getCurrentTime()
        });

        currentConversation.push({
            role: "assistant",
            message: data.response,
            time: getCurrentTime()
        });

        // Save complete conversation to history
        let history = JSON.parse(localStorage.getItem("history")) || [];
        history.unshift({
            question: userInput,
            answer: data.response,
            task: selectedTask,
            time: getCurrentTime()
        });

        history = history.slice(0, 20);
        localStorage.setItem("history", JSON.stringify(history));
        loadHistory();

        // ==========================
        // AI Bubble
        // ==========================
        const aiBubble = document.createElement("div");
        aiBubble.className = "chat-message ai-message";
        aiBubble.innerHTML = `
            <strong>🤖 EduGenie AI</strong>
            <span style="float:right;font-size:12px;opacity:.7;">
                ${getCurrentTime()}
            </span>
            <br><br>
            ${data.response}
        `;
        chatContainer.appendChild(aiBubble);
        aiBubble.scrollIntoView({ behavior: "smooth" });

        // ==========================
        // Show Action Buttons Safely
        // ==========================
        if (copyBtn) copyBtn.style.display = "inline-flex";
        if (speakBtn) speakBtn.style.display = "inline-flex";
        if (pdfBtn) pdfBtn.style.display = "inline-flex";

        // ==========================
        // Reset Uploads Safely
        // ==========================
        selectedImage = null;
        selectedPDF = null;
        if (imageInput) imageInput.value = "";
        if (pdfInput) pdfInput.value = "";
        if (imagePreview) imagePreview.innerHTML = "";
        if (pdfPreview) pdfPreview.innerHTML = "";

    } catch (error) {
        loading.remove();
        const errorBubble = document.createElement("div");
        errorBubble.className = "chat-message ai-message";
        errorBubble.innerHTML = `❌ ${error.message}`;
        chatContainer.appendChild(errorBubble);
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            Generate
        `;
    }
}

// ======================================
// Copy Latest AI Response
// ======================================
async function copyResponse() {
    if (!latestResponse) {
        alert("Generate a response first.");
        return;
    }

    const temp = document.createElement("div");
    temp.innerHTML = latestResponse;
    const text = temp.innerText.trim();

    try {
        await navigator.clipboard.writeText(text);
        if (copyBtn) {
            copyBtn.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Copied!
            `;
            copyBtn.style.background = "#22c55e";
            copyBtn.style.color = "#ffffff";

            setTimeout(() => {
                copyBtn.innerHTML = `
                    <i class="fa-regular fa-copy"></i>
                    Copy
                `;
                copyBtn.style.background = "";
                copyBtn.style.color = "";
            }, 2000);
        }
    } catch (error) {
        alert("Clipboard access is not supported.");
    }
}

// ======================================
// Download PDF
// ======================================
function downloadPDF() {
    if (!latestResponse) {
        alert("Generate a response first.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const temp = document.createElement("div");
    temp.innerHTML = latestResponse;
    const text = temp.innerText.trim();

    doc.setFont("helvetica");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 15, 20);

    doc.save(`EduGenie_${Date.now()}.pdf`);
}

// ======================================
// Feature Cards Animations
// ======================================
document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("click", () => {
        if (task) task.value = card.dataset.task;
        if (inputText) inputText.focus();

        card.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(0.95)" },
                { transform: "scale(1)" }
            ],
            { duration: 180 }
        );
    });
});

// ======================================
// Conversation History Loader
// ======================================
function loadHistory() {
    if (!historyList) return;
    const history = JSON.parse(localStorage.getItem("history")) || [];
    historyList.innerHTML = "";

    history.forEach(chat => {
        const li = document.createElement("li");
        li.className = "history-item";
        li.innerHTML = `
            <strong>${chat.question}</strong>
            <br>
            <small>
                ${chat.task ? chat.task.toUpperCase() : "AI"} • ${chat.time}
            </small>
        `;
        li.addEventListener("click", () => {
            restoreConversation(chat);
        });
        historyList.appendChild(li);
    });
}

// ======================================
// Restore Conversation
// ======================================
function restoreConversation(chat) {
    if (!chatContainer) return;
    
    if (inputText) inputText.value = chat.question;
    latestResponse = chat.answer;
    chatContainer.innerHTML = "";

    // Sync active conversational memory with the restored state
    currentConversation = [
        { role: "user", message: chat.question, time: chat.time },
        { role: "assistant", message: chat.answer, time: chat.time }
    ];

    const userBubble = document.createElement("div");
    userBubble.className = "chat-message user-message";
    userBubble.innerHTML = `
        <strong>👤 You</strong>
        <span style="float:right;font-size:12px;opacity:.7;">
            ${chat.time}
        </span>
        <br><br>
        ${chat.question}
    `;

    const aiBubble = document.createElement("div");
    aiBubble.className = "chat-message ai-message";
    aiBubble.innerHTML = `
        <strong>🤖 EduGenie AI</strong>
        <span style="float:right;font-size:12px;opacity:.7;">
            ${chat.time}
        </span>
        <br><br>
        ${chat.answer}
    `;

    chatContainer.appendChild(userBubble);
    chatContainer.appendChild(aiBubble);

    aiBubble.scrollIntoView({ behavior: "smooth" });

    // Ensure action buttons are visible for the loaded chat
    if (copyBtn) copyBtn.style.display = "inline-flex";
    if (speakBtn) speakBtn.style.display = "inline-flex";
    if (pdfBtn) pdfBtn.style.display = "inline-flex";
}

// ======================================
// Typing Animation
// ======================================
async function typeWriter(element, text, speed = 12) {
    if (!element) return;
    element.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
        element.innerHTML += text[i];
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

// ======================================
// Utilities
// ======================================
function getCurrentTime() {
    return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ======================================
// Voice Input Initialization
// ======================================
function initialiseVoice() {
    const voiceBtn = document.getElementById("voiceBtn");
    if (!voiceBtn) return;

    if (!("webkitSpeechRecognition" in window)) {
        voiceBtn.style.display = "none";
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    voiceBtn.addEventListener("click", () => {
        recognition.start();
        voiceBtn.innerHTML = `<i class="fa-solid fa-microphone-lines"></i>`;
    });

    recognition.onresult = (event) => {
        if (inputText) inputText.value = event.results[0][0].transcript;
    };

    recognition.onend = () => {
        voiceBtn.innerHTML = `<i class="fa-solid fa-microphone"></i>`;
    };
}

// ======================================
// Speak / Stop AI Response
// ======================================
let isSpeaking = false;
let speech = null;

function speakResponse() {
    if (!latestResponse) {
        alert("Generate a response first.");
        return;
    }

    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        if (speakBtn) {
            speakBtn.innerHTML = `
                <i class="fa-solid fa-volume-high"></i>
                Speak
            `;
        }
        return;
    }

    const temp = document.createElement("div");
    temp.innerHTML = latestResponse;
    const text = temp.innerText.trim();

    speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    isSpeaking = true;
    if (speakBtn) {
        speakBtn.innerHTML = `
            <i class="fa-solid fa-stop"></i>
            Stop
        `;
    }

    speech.onend = () => {
        isSpeaking = false;
        if (speakBtn) {
            speakBtn.innerHTML = `
                <i class="fa-solid fa-volume-high"></i>
                Speak
            `;
        }
    };

    speech.onerror = () => {
        isSpeaking = false;
        if (speakBtn) {
            speakBtn.innerHTML = `
                <i class="fa-solid fa-volume-high"></i>
                Speak
            `;
        }
    };

    speechSynthesis.speak(speech);
}

// ======================================
// File Uploads Initializer
// ======================================
function initialiseUploads() {
    // Image Upload
    if (imageBtn && imageInput) {
        imageBtn.addEventListener("click", () => imageInput.click());
        imageInput.addEventListener("change", () => {
            const file = imageInput.files[0];
            if (!file) return;

            selectedImage = file;
            selectedPDF = null; // Mutually exclusive balance

            if (pdfInput) pdfInput.value = "";
            if (pdfPreview) pdfPreview.innerHTML = "";

            if (imagePreview) {
                imagePreview.innerHTML = `
                    <img src="${URL.createObjectURL(file)}" style="width:220px; margin-top:15px; border-radius:12px; box-shadow:0 0 15px rgba(0,0,0,.25);">
                `;
            }
        });
    }

    // PDF Upload
    if (pdfBtnUpload && pdfInput) {
        pdfBtnUpload.addEventListener("click", () => pdfInput.click());
        pdfInput.addEventListener("change", () => {
            const file = pdfInput.files[0];
            if (!file) return;

            selectedPDF = file;
            selectedImage = null; // Mutually exclusive balance

            if (imageInput) imageInput.value = "";
            if (imagePreview) imagePreview.innerHTML = "";

            if (pdfPreview) {
                pdfPreview.innerHTML = `
                    <div style="margin-top:15px; padding:12px; border-radius:12px; background:rgba(255,255,255,.15); color:white; font-weight:600;">
                        📄 ${file.name}
                    </div>
                `;
            }
        });
    }
}

// =======================================
// Theme Toggle Initializer
// =======================================
function initialiseTheme() {
    if (!themeBtn) return;

    // Load saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeBtn.innerHTML = "☀️";
    } else {
        themeBtn.innerHTML = "🌙";
    }

    // Register active event listener omitted in earlier version
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
}

// ======================================
// System Confirmation Logs
// ======================================
console.log("✅ EduGenie V2 Fully Repaired & Loaded Successfully");

// ======================================
// New Chat
// ======================================

newChatBtn.addEventListener("click", newChat);

function newChat() {

    // Clear current conversation

    currentConversation = [];

    // Clear chat window

    if (chatContainer) {

        chatContainer.innerHTML = `

            <div class="welcome-card">

                <h2>👋 Welcome to EduGenie AI</h2>

                <p>

                    I'm your personal AI Learning Assistant.

                </p>

                <br>

                <p>

                    📖 Ask Questions<br><br>

                    🧠 Explain Difficult Concepts<br><br>

                    📝 Summarize Notes<br><br>

                    🎯 Generate Quizzes<br><br>

                    🚀 Create Learning Roadmaps

                </p>

            </div>

        `;

    }

    // Clear input

    inputText.value = "";

    // Clear uploads

    selectedImage = null;
    selectedPDF = null;

    imageInput.value = "";
    pdfInput.value = "";

    imagePreview.innerHTML = "";

    if (pdfPreview) {

        pdfPreview.innerHTML = "";

    }

    // Hide action buttons

    copyBtn.style.display = "none";
    speakBtn.style.display = "none";
    pdfBtn.style.display = "none";

    latestResponse = "";

    inputText.focus();

}

// ======================================
// Chat History Toggle
// ======================================

historyToggle.addEventListener("click", () => {

    if (historyContainer.style.display === "block") {

        historyContainer.style.display = "none";
        historyArrow.innerHTML = "▼";

    } else {

        historyContainer.style.display = "block";
        historyArrow.innerHTML = "▲";

    }

});

// ======================================
// Floating Navbar
// ======================================

const navbar =
document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

    if(window.scrollY>220){

        navbar.classList.add("show");

    }

    else{

        navbar.classList.remove("show");

    }

});