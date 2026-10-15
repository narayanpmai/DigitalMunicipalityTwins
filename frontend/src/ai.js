document.addEventListener('DOMContentLoaded', () => {
  console.log("AI Logic Initialized");

  // --- 1. AI ASSISTANT CHAT LOGIC ---
  const chatView = document.getElementById('view-assistant');
  if (chatView) {
    const chatInput = chatView.querySelector('input[type="text"]');
    const sendBtn = chatView.querySelector('.input-group .btn-primary');
    const chatContainer = chatView.querySelector('.overflow-auto');

    const appendMessage = (text, isUser = false) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `d-flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`;
      
      const iconHTML = isUser 
        ? `<div class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;"><i class="bi bi-person"></i></div>`
        : `<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;"><i class="bi bi-robot"></i></div>`;
      
      const bubbleClass = isUser 
        ? `bg-primary text-white p-3 rounded-4 shadow-sm` 
        : `bg-white p-3 rounded-4 shadow-sm text-dark`;
        
      const radiusStyle = isUser ? `border-top-right-radius: 0; max-width: 75%;` : `border-top-left-radius: 0; max-width: 75%;`;

      msgDiv.innerHTML = `
        ${iconHTML}
        <div class="${bubbleClass}" style="${radiusStyle}">
          <p class="mb-0">${text}</p>
        </div>
      `;
      chatContainer.appendChild(msgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    const handleSend = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      // User Message
      appendMessage(text, true);
      chatInput.value = '';

      // Mock AI Loading
      const typingId = 'typing-' + Date.now();
      const typingDiv = document.createElement('div');
      typingDiv.id = typingId;
      typingDiv.className = 'd-flex gap-3 mb-4';
      typingDiv.innerHTML = `
        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 40px; height: 40px;"><i class="bi bi-robot"></i></div>
        <div class="bg-white p-3 rounded-4 shadow-sm text-muted" style="border-top-left-radius: 0; max-width: 75%;">
          <i class="bi bi-three-dots text-primary typing-animation"></i> सोच्दैछु...
        </div>
      `;
      chatContainer.appendChild(typingDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // Mock AI Response after 1.5s
      setTimeout(() => {
        document.getElementById(typingId)?.remove();
        appendMessage(`तपाईंले भन्नुभएको "${text}" को बारेमा मलाई जानकारी छ। हाल यो प्रणाली परीक्षण (Demo) चरणमा रहेकोले म वास्तविक डेटामा आधारित उत्तर दिन असमर्थ छु। कृपया केही समय कुर्नुहोस्।`);
      }, 1500);
    };

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // --- 2. FORM GENERATOR LOGIC ---
  const setupFormGenerator = (viewId, buttonSelector, outputSelector, successMsg) => {
    const view = document.getElementById(viewId);
    if (!view) return;

    const btn = view.querySelector(buttonSelector);
    const outputBox = view.querySelector(outputSelector);
    if (!btn || !outputBox) return;

    // Find the italic placeholder text paragraph
    const placeholderP = Array.from(outputBox.querySelectorAll('p')).find(p => p.textContent.includes('AI ले'));

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> तयार गर्दै...`;
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = `<i class="bi bi-check2-circle me-2"></i> तयार भयो`;
        btn.classList.remove('btn-primary', 'btn-warning', 'btn-danger', 'btn-info');
        btn.classList.add('btn-success');
        
        if (placeholderP) {
          placeholderP.innerHTML = `<span class="text-dark fw-medium">${successMsg} <br><br>(यो एउटा Demo जेनेरेटेड डकुमेन्ट हो। भविष्यमा यहाँ वास्तविक AI-जेनेरेटेड कन्टेन्ट आउनेछ।)</span>`;
          placeholderP.style.color = '#1e293b';
        }

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
          btn.className = btn.getAttribute('data-original-class') || btn.className.replace('btn-success', 'btn-primary');
        }, 3000);
      }, 1500);
    });
    
    // Store original class for reset
    btn.setAttribute('data-original-class', btn.className);
  };

  setupFormGenerator('view-letter', '.btn.w-100', '.bg-white.border.rounded', 'उपर्युक्त सम्बन्धमा, यस पाँचपोखरी थाङपाल गाउँपालिकाको वडा कार्यालयबाट माग भए बमोजिमको विवरण यसै पत्रसाथ संलग्न राखी पठाइएको व्यहोरा अनुरोध छ।');
  setupFormGenerator('view-application', '.btn.w-100', '.bg-white.border.rounded', 'मलाई घरायसी काम परेकोले मिति २०८१/०४/१५ गते देखि ३ दिनसम्म कार्यालयमा उपस्थित हुन नसक्ने भएकोले उक्त दिनहरूको बिदा स्वीकृत गरिदिनुहुन श्रीमान् समक्ष यो निवेदन पेस गरेको छु।');
  setupFormGenerator('view-tippani', '.btn.w-100', '.bg-white.border.rounded', 'यस गाउँपालिकाको वडा नं. २ मा खानेपानी मर्मत सम्भारको लागि रु. ५०,०००/- (अक्षरेपी पचास हजार मात्र) बजेट आवश्यक परेको भनी वडा कार्यालयबाट माग भई आएको सन्दर्भमा, उक्त रकम विनियोजित बजेटबाट खर्च लेख्ने गरी निकासा दिन उपयुक्त देखिएकोले निर्णयार्थ पेस गरेको छु।');
  setupFormGenerator('view-new-tippani', '.btn.w-100', '.bg-white.border.rounded', 'प्रस्तावित नयाँ कार्यक्रमको लागि पेश भएको विवरण बमोजिम आवश्यक प्रक्रिया अगाडि बढाउन उपयुक्त देखिन्छ।');
  setupFormGenerator('view-recommendation', '.btn.w-100', '.bg-white.border.rounded', 'यस वडा कार्यालयको अभिलेख अनुसार निज निवेदक यसै वडाको स्थायी बासिन्दा रहेको र निजले माग गरे बमोजिमको सिफारिस दिन मनासिब देखिएकोले यो सिफारिस प्रदान गरिएको छ।');

});
