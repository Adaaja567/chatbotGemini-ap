// script.js

(function () {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');

  if (!form || !input || !chatBox) {
    console.error('Chat elements not found in DOM.');
    return;
  }

  /**
   * Tambah pesan ke chat-box.
   * role: "user" atau "bot"
   */
  function addMessage(role, text) {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    messageEl.classList.add(role === 'user' ? 'user-message' : 'bot-message');
    messageEl.textContent = text;

    chatBox.appendChild(messageEl);
    chatBox.scrollTop = chatBox.scrollHeight; // auto scroll ke bawah
    return messageEl;
  }

  /** Ganti isi teks dari pesan (dipakai untuk mengganti "Thinking..." dengan jawaban) */
  function updateMessage(messageEl, newText) {
    if (!messageEl) return;
    messageEl.textContent = newText;
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessageToServer(userText, thinkingMessageEl) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: [
            {
              role: 'user',
              text: userText,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error('Server responded with status:', response.status);
        updateMessage(thinkingMessageEl, 'Failed to get response from server.');
        return;
      }

      const data = await response.json();

      // Backend diharapkan mengembalikan: { "result": "<gemini_ai_response>" }
      if (data && typeof data.result === 'string' && data.result.trim() !== '') {
        updateMessage(thinkingMessageEl, data.result.trim());
      } else {
        updateMessage(thinkingMessageEl, 'Sorry, no response received.');
      }
    } catch (error) {
      console.error('Error while calling /api/chat:', error);
      updateMessage(thinkingMessageEl, 'Failed to get response from server.');
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const userText = input.value.trim();
    if (!userText) {
      return;
    }

    // 1. Tampilkan pesan user di chat
    addMessage('user', userText);

    // 2. Kosongkan input
    input.value = '';
    input.focus();

    // 3. Tampilkan pesan bot sementara "Thinking..."
    const thinkingMessageEl = addMessage('bot', 'Thinking...');

    // 4. Kirim ke backend dan update pesan bot ketika respons datang
    sendMessageToServer(userText, thinkingMessageEl);
  });
})();