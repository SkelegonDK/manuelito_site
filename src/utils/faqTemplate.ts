export function createFAQTemplate(service: any) {
  return `
    <div 
      class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="modal-content bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-lg w-full relative animate-fade-in">
        <button 
          class="absolute top-4 right-4 text-black dark:text-white text-2xl  rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-1" 
          aria-label="Close FAQ" 
          id="close-faq-btn"
          tabindex="0"
        >&times;</button>
        <h4 class="text-2xl  mb-4 text-black dark:text-white flex items-center gap-2" id="modal-title">
          <span style="display:inline-block;vertical-align:middle;"></span> FAQ: ${service.title}
        </h4>
        <ul class="space-y-4">
          ${service.faqs.map((faq: any) => `
            <li>
              <details class="group">
                <summary class="cursor-pointer text-lg font-medium text-black dark:text-white group-open:text-blue-700 dark:group-open:text-blue-400 transition-colors rounded-md p-1">${faq.question}</summary>
                <div class="mt-2 text-gray-700 dark:text-gray-200 text-base pl-4">${faq.answer}</div>
              </details>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
} 