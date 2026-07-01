var AppSupport = (function () {
    'use strict';

    var STORAGE_KEY = 'sbg_chat_history';

    var state = {
        open: false,
        userData: {},
        appStep: null,
        ticketStep: null,
        ticketData: {},
        recording: false,
        mediaRecorder: null,
        audioChunks: []
    };

    var quickActions = [
        { label: 'Apply Now', action: 'I want to apply for a grant' },
        { label: 'Eligibility', action: 'Who is eligible?' },
        { label: 'Grant Types', action: 'What grants are available?' },
        { label: 'Documents', action: 'What documents do I need?' },
        { label: 'Help Me Apply', action: 'Help me with my application' },
        { label: 'Live Agent', action: 'Talk to a human agent' }
    ];

    var supportData = null;

    function loadSupportData() {
        supportData = window.SUPPORT_DATA || null;
        if (!supportData) {
            supportData = {
                botName: 'Assistant', greeting: 'Hi! How can I help you today?',
                fallback: 'Let me connect you with a human agent.',
                items: [], applicationFlow: []
            };
        }
    }

    function now() {
        var d = new Date();
        var h = d.getHours().toString().padStart(2, '0');
        var m = d.getMinutes().toString().padStart(2, '0');
        return h + ':' + m;
    }

    function addMessage(text, isUser, skipSave) {
        var container = document.getElementById('supportMessages');
        if (!container) return;
        var div = document.createElement('div');
        div.className = 'msg ' + (isUser ? 'user' : 'bot');
        var ts = now();
        if (!isUser) {
            div.innerHTML = '<div class="msg-text">' + text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') + '</div><div class="msg-ts">' + ts + '</div>';
        } else {
            div.innerHTML = '<div class="msg-text">' + escapeHtml(text) + '</div><div class="msg-ts">' + ts + '</div>';
        }
        container.appendChild(div);
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        if (!skipSave) saveToStorage({ text: text, isUser: isUser, ts: ts });
    }

    function addAudioMessage(blob, isUser) {
        var container = document.getElementById('supportMessages');
        if (!container) return;
        var div = document.createElement('div');
        div.className = 'msg ' + (isUser ? 'user' : 'bot');
        var url = URL.createObjectURL(blob);
        var ts = now();
        div.innerHTML = '<div class="msg-file"><i class="fas fa-microphone"></i> Voice Note <audio src="' + url + '" controls style="width:100%;margin-top:6px;" preload="none"></audio></div><div class="msg-ts">' + ts + '</div>';
        container.appendChild(div);
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        saveToStorage({ text: '[Voice note]', isUser: isUser, ts: ts });
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function showTyping() {
        var container = document.getElementById('supportMessages');
        if (!container) return;
        if (document.getElementById('typingIndicator')) return;
        var div = document.createElement('div');
        div.className = 'msg typing';
        div.id = 'typingIndicator';
        div.innerHTML = '<span></span><span></span><span></span>';
        container.appendChild(div);
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }

    function hideTyping() {
        var el = document.getElementById('typingIndicator');
        if (el) el.remove();
    }

    function addFollowUp(question) {
        var container = document.getElementById('supportMessages');
        if (!container) return;
        var outer = document.createElement('div');
        outer.className = 'followup-wrap';
        var btn = document.createElement('button');
        btn.className = 'followup-btn';
        btn.textContent = question;
        btn.addEventListener('click', function () {
            addMessage(question, true);
            setTimeout(function () { handleResponse(question); }, 300);
        });
        outer.appendChild(btn);
        container.appendChild(outer);
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }

    function handleResponse(userText) {
        if (!supportData || !supportData.items) {
            setTimeout(function () { addMessage('Hi! How can I help you today?', false); }, 300);
            return;
        }

        var lower = userText.toLowerCase();

        if (lower.includes('talk to a human') || lower.includes('live agent') || lower.includes('human agent') || lower.includes('real person') || lower.includes('submit ticket')) {
            state.ticketStep = 0;
            state.ticketData = {};
            setTimeout(function () {
                addMessage('I\'ll connect you with a human agent! First, what is your **full name**?', false);
            }, 300);
            return;
        }

        if (state.ticketStep !== null) {
            handleTicketStep(userText);
            return;
        }

        if (lower.includes('help me with my application') || lower.includes('help me apply') || lower.includes('guide me') || lower.includes('walk me through')) {
            state.appStep = 0;
            state.userData = {};
            var flow = supportData.applicationFlow || [];
            if (flow.length) {
                setTimeout(function () {
                    addMessage('I\'d be happy to help you complete your application! Let me guide you through it step by step.\n\n' + flow[0].question, false);
                }, 300);
            }
            return;
        }

        if (state.appStep !== null) {
            handleApplicationStep(userText);
            return;
        }

        var best = null;
        var bestScore = 0;
        supportData.items.forEach(function (item) {
            if (item.id === 'application_help_collect' || item.id === 'verify_info') return;
            var score = 0;
            item.keywords.forEach(function (kw) {
                if (lower.includes(kw)) score++;
            });
            if (score > bestScore) { bestScore = score; best = item; }
        });

        showTyping();
        setTimeout(function () {
            hideTyping();
            if (best && bestScore > 0) {
                addMessage(best.a, false);
                if (best.followUps && best.followUps.length) {
                    best.followUps.forEach(function (fq) { addFollowUp(fq); });
                } else {
                    addFollowUp('Talk to a human agent');
                }
            } else {
                addMessage(supportData.fallback || 'I\'m not sure. Would you like to speak with a human agent?', false);
                addFollowUp('Talk to a human agent');
                addFollowUp('Help me with my application');
            }
        }, 600 + Math.random() * 400);
    }

    function handleApplicationStep(userText) {
        var flow = supportData.applicationFlow || [];
        if (!flow.length) return;
        var step = flow[state.appStep];
        if (!step) { state.appStep = null; submitCompiled(); return; }
        if (step.field === 'review') {
            showTyping();
            setTimeout(function () {
                hideTyping();
                var parts = [];
                for (var k in state.userData) {
                    parts.push('<strong>' + k + ':</strong> ' + state.userData[k]);
                }
                addMessage('Great! Here\'s your summary:\n\n' + parts.join('\n') + '\n\nSay "yes" to submit or "no" to restart.', false);
                addFollowUp('Yes, submit');
                addFollowUp('No, restart');
            }, 500);
            return;
        }
        state.userData[step.field] = userText;
        state.appStep++;
        var nextStep = flow[state.appStep];
        if (nextStep) {
            showTyping();
            setTimeout(function () {
                hideTyping();
                addMessage('Thanks! ' + nextStep.question, false);
            }, 500);
        } else {
            state.appStep = null;
            submitCompiled();
        }
    }

    function submitCompiled() {
        var parts = [];
        for (var k in state.userData) {
            parts.push('<strong>' + k + ':</strong> ' + state.userData[k]);
        }
        addMessage('I\'ve compiled your info:\n\n' + parts.join('\n') + '\n\nGo to the Apply page to submit!', false);
        addFollowUp('Take me to the Apply page');
        addFollowUp('What happens after I submit?');
        addFollowUp('Upload documents');
    }

    function handleTicketStep(userText) {
        var steps = ['name', 'email', 'subject', 'message'];
        var stepIdx = state.ticketStep;
        if (stepIdx >= steps.length) { state.ticketStep = null; return; }
        var field = steps[stepIdx];
        state.ticketData[field] = userText;
        state.ticketStep++;
        if (state.ticketStep >= steps.length) {
            showTyping();
            setTimeout(function () {
                hideTyping();
                var base = window.BASE_PATH || '/';
                fetch(base + 'includes/support.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: state.ticketData.name,
                        email: state.ticketData.email,
                        subject: state.ticketData.subject,
                        message: state.ticketData.message
                    })
                })
                .then(function (r) { return r.json(); })
                .then(function (res) {
                    if (res.success) {
                        addMessage('Support ticket #' + (res.ticket ? res.ticket.id : '') + ' created! A human agent will respond within **24 hours**. You\'ll receive updates at **' + state.ticketData.email + '**.\n\nWhile you wait, feel free to continue exploring the site or start your application!', false);
                        addFollowUp('How do I apply?');
                        addFollowUp('What grants are available?');
                    } else {
                        addMessage('Sorry, there was an issue creating your ticket. Please try again or email us directly.', false);
                        addFollowUp('Talk to a human agent');
                    }
                })
                .catch(function () {
                    addMessage('Network issue. Please email us at info@sbgrant.com for assistance.', false);
                });
                state.ticketStep = null;
                state.ticketData = {};
            }, 500);
        } else {
            var prompts = ['Thanks! What is your **email address**?', 'Great! What is the **subject** of your request?', 'Perfect! Please describe your **issue or question** in detail:'];
            showTyping();
            setTimeout(function () {
                hideTyping();
                addMessage(prompts[stepIdx], false);
            }, 400);
        }
    }

    function saveToStorage(entry) {
        try {
            var stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            stored.push(entry);
            if (stored.length > 100) stored = stored.slice(-100);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        } catch (e) {}
    }

    function loadFromStorage() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) { return []; }
    }

    function clearStorage() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }

    function restoreMessages() {
        var container = document.getElementById('supportMessages');
        if (!container) return;
        var stored = loadFromStorage();
        stored.forEach(function (entry) {
            var div = document.createElement('div');
            div.className = 'msg ' + (entry.isUser ? 'user' : 'bot');
            var ts = entry.ts || '';
            if (!entry.isUser) {
                div.innerHTML = '<div class="msg-text">' + (entry.text || '').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') + '</div><div class="msg-ts">' + ts + '</div>';
            } else {
                div.innerHTML = '<div class="msg-text">' + escapeHtml(entry.text || '') + '</div><div class="msg-ts">' + ts + '</div>';
            }
            container.appendChild(div);
        });
        container.scrollTop = container.scrollHeight;
    }

    function renderQuickActions(container) {
        if (!container) return;
        quickActions.forEach(function (item) {
            var btn = document.createElement('button');
            btn.textContent = item.label;
            btn.addEventListener('click', function () {
                addMessage(item.action, true);
                setTimeout(function () { handleResponse(item.action); }, 400);
            });
            container.appendChild(btn);
        });
    }

    function startVoiceRecording(voiceBtn, voiceInput) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            voiceInput.click();
            return;
        }

        if (state.recording) {
            state.recording = false;
            if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
                state.mediaRecorder.stop();
            }
            voiceBtn.classList.remove('recording');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            return;
        }

        state.audioChunks = [];

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                state.recording = true;
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
                state.mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });

                state.mediaRecorder.ondataavailable = function (e) {
                    if (e.data.size > 0) state.audioChunks.push(e.data);
                };

                state.mediaRecorder.onstop = function () {
                    stream.getTracks().forEach(function (t) { t.stop(); });
                    var blob = new Blob(state.audioChunks, { type: state.mediaRecorder.mimeType });
                    addAudioMessage(blob, true);
                    addMessage('Thanks for the voice note! Our team will review it along with your application.', false);
                    addFollowUp('How do I apply?');
                    addFollowUp('What documents do I need?');
                    state.recording = false;
                    voiceBtn.classList.remove('recording');
                    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                };

                state.mediaRecorder.onerror = function () {
                    state.recording = false;
                    voiceBtn.classList.remove('recording');
                    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    voiceInput.click();
                };

                state.mediaRecorder.start();
            })
            .catch(function () {
                voiceInput.click();
            });
    }

    function init() {
        var btn = document.getElementById('supportBtn');
        var widget = document.getElementById('supportWidget');
        var input = document.getElementById('supportInput');
        var sendBtn = document.getElementById('supportSend');
        var attachBtn = document.getElementById('supportAttach');
        var fileInput = document.getElementById('supportFileInput');
        var voiceBtn = document.getElementById('supportVoiceBtn');
        var voiceInput = document.getElementById('supportVoiceInput');
        var minimizeBtn = document.getElementById('supportMinimize');
        var messages = document.getElementById('supportMessages');
        var actions = document.getElementById('quickActions');

        if (!btn || !widget) return;

        loadSupportData();
        renderQuickActions(actions);

        var firstOpen = true;

        btn.addEventListener('click', function () {
            state.open = !state.open;
            btn.classList.toggle('active', state.open);
            widget.classList.toggle('open', state.open);
            if (state.open) {
                if (firstOpen) {
                    restoreMessages();
                    firstOpen = false;
                }
                if (!messages.querySelector('.msg')) {
                    addMessage((supportData && supportData.greeting) || 'Hi! How can I help you today?', false);
                }
                input.focus();
                setTimeout(function () { messages.scrollTo({ top: messages.scrollHeight, behavior: 'smooth' }); }, 100);
            }
        });

        function sendMsg() {
            var text = input.value.trim();
            if (!text) return;
            addMessage(text, true);
            input.value = '';
            setTimeout(function () { handleResponse(text); }, 400);
        }

        sendBtn.addEventListener('click', sendMsg);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') sendMsg();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && state.open) {
                state.open = false;
                btn.classList.remove('active');
                widget.classList.remove('open');
            }
        });

        attachBtn.addEventListener('click', function () { fileInput.click(); });
        fileInput.addEventListener('change', function () {
            if (fileInput.files.length) {
                addMessage('[Uploaded: ' + fileInput.files[0].name + ']', true);
                addMessage('Thanks! I\'ve received your file. You can also upload documents in the application form.', false);
                addFollowUp('Upload more files');
                addFollowUp('What documents do I need?');
                fileInput.value = '';
            }
        });

        if (voiceBtn && voiceInput) {
            voiceBtn.addEventListener('click', function () {
                startVoiceRecording(voiceBtn, voiceInput);
            });
            voiceInput.addEventListener('change', function () {
                if (voiceInput.files.length) {
                    addMessage('[Voice note: ' + voiceInput.files[0].name + ']', true);
                    addMessage('Thanks for the voice note! Our team will review it along with your application.', false);
                    addFollowUp('How do I apply?');
                    voiceInput.value = '';
                }
            });
        }

        var clearBtn = document.getElementById('supportClear');
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                clearStorage();
                messages.innerHTML = '';
                firstOpen = true;
                addMessage((supportData && supportData.greeting) || 'Hi! How can I help you today?', false);
            });
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', function () {
                state.open = false;
                btn.classList.remove('active');
                widget.classList.remove('open');
            });
        }
    }

    return { init: init };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AppSupport.init);
} else {
    AppSupport.init();
}
