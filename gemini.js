// Multi-Provider AI Integration (Gemini, Groq, Mistral) with Intelligent Key Rotation

const GEMINI_KEYS = [
    "AIzaSyC6m7hhObTbh1Gpga04uCvGagADFmrjkRM",
    "AIzaSyC93J1ozXUPTDI4k88fGABve1rS3YTx5LM",
    "AIzaSyCdPDpBgl9jT7b180ax5J1Z5dJi-wzp9WU",
    "AIzaSyD31aesmyMKTqqpmjrv_LH3bvufsnzicXI",
    "AIzaSyCMU-3-lBnAHqXH47CgE4wQaiYcQVda5J8",
    "AIzaSyCyVrPdTVEU1yx9Z9POqqju7LKoVQzH0H4"
];

const GROQ_KEYS = [
    "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",
    "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",
    "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",
    "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",
    "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",
    "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"
];

const MISTRAL_KEYS = [
    "7gQnrH8x3K20KVXCjPmdvRRLsDXm9Oqo",
    "bHMMJU2KaANwK81HA5rl7fKWuwFF5HuP",
    "NMQyfHgytDkUuYA4GpVkzGmPwPPVj0Ga",
    "tlkdzVBuQBEtUzkHXr91PjTf0e597en2",
    "5jajJgOqQvKWhaT4CiBqvekE5cCAPPr9",
    "wGrwdIAbQbZgBVc9fN9uQbPQ35zbGH2b"
];

/**
 * Envia una petición a la API de IA usando rotación de llaves y proveedores (Gemini -> Groq -> Mistral).
 * Mantiene compatibilidad de nombre para no romper la app.
 */
async function askGemini(prompt, history = [], activeCode = '', fileName = '') {
    const systemPrompt = `Eres un asistente de programación experto en AndroCode. 
Ayudas al usuario a programar en lenguajes como HTML, CSS, JavaScript, Python y Markdown directamente desde su celular.
Mantén tus respuestas claras, precisas y optimizadas para leerse en pantallas móviles.
Si el usuario provee código, analízalo con detalle.
Usa formato Markdown para las respuestas, y coloca bloques de código formateados con su lenguaje respectivo.
${activeCode ? `El archivo actual que el usuario está editando se llama "${fileName}" y contiene este código:\n\`\`\`\n${activeCode}\n\`\`\`` : ''}`;

    // Obtener preferencias del usuario
    const userKey = localStorage.getItem('androcode_user_api_key')?.trim();
    const preferredProvider = localStorage.getItem('androcode_preferred_provider') || 'auto';
    
    // Construir lista de claves según la preferencia del usuario
    let keysToTry = [];
    
    // Añadir clave personalizada del usuario primero si existe
    if (userKey) {
        if (userKey.startsWith('AIzaSy')) {
            keysToTry.push({ provider: 'gemini', key: userKey });
        } else if (userKey.startsWith('gsk_')) {
            keysToTry.push({ provider: 'groq', key: userKey });
        } else {
            keysToTry.push({ provider: 'mistral', key: userKey });
        }
    }

    // Ordenar los proveedores de respaldo según la preferencia
    const providerOrder = {
        'gemini':  [
            ...GEMINI_KEYS.map(k => ({ provider: 'gemini', key: k })),
            ...GROQ_KEYS.map(k => ({ provider: 'groq', key: k })),
            ...MISTRAL_KEYS.map(k => ({ provider: 'mistral', key: k }))
        ],
        'groq':    [
            ...GROQ_KEYS.map(k => ({ provider: 'groq', key: k })),
            ...GEMINI_KEYS.map(k => ({ provider: 'gemini', key: k })),
            ...MISTRAL_KEYS.map(k => ({ provider: 'mistral', key: k }))
        ],
        'mistral': [
            ...MISTRAL_KEYS.map(k => ({ provider: 'mistral', key: k })),
            ...GEMINI_KEYS.map(k => ({ provider: 'gemini', key: k })),
            ...GROQ_KEYS.map(k => ({ provider: 'groq', key: k }))
        ],
        'auto': [
            ...GROQ_KEYS.map(k => ({ provider: 'groq', key: k })),    // Groq primero (más rápido)
            ...GEMINI_KEYS.map(k => ({ provider: 'gemini', key: k })),
            ...MISTRAL_KEYS.map(k => ({ provider: 'mistral', key: k }))
        ]
    };

    keysToTry.push(...(providerOrder[preferredProvider] || providerOrder['auto']));

    // Intentar la petición recorriendo todos los proveedores disponibles
    for (let attempts = 0; attempts < keysToTry.length; attempts++) {
        const item = keysToTry[attempts];
        
        try {
            console.log(`Intentando llamada IA (Intento ${attempts + 1}/${keysToTry.length}) con Proveedor: ${item.provider}`);
            
            if (item.provider === 'gemini') {
                return await callGeminiAPI(item.key, systemPrompt, prompt, history);
            } else if (item.provider === 'groq') {
                return await callGroqAPI(item.key, systemPrompt, prompt, history);
            } else if (item.provider === 'mistral') {
                return await callMistralAPI(item.key, systemPrompt, prompt, history);
            }

        } catch (error) {
            console.warn(`Intento ${attempts + 1} (${item.provider}) fallido:`, error.message);
            
            // Si hemos probado todas las opciones, lanzar error final descriptivo
            if (attempts === keysToTry.length - 1) {
                throw new Error("Todos los proveedores (Gemini, Groq y Mistral) fallaron o sus claves están agotadas. Introduce tu propia API Key en el panel del asistente.");
            }
        }
    }
}

// Lógica de Petición para Gemini API
async function callGeminiAPI(key, systemPrompt, prompt, history) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    const contents = [];
    history.forEach(msg => {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    });
    contents.push({
        role: 'user',
        parts: [{ text: prompt }]
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Formato inválido en la respuesta de Gemini");
    return text;
}

// Lógica de Petición para Groq API (Formatos compatibles con OpenAI)
async function callGroqAPI(key, systemPrompt, prompt, history) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    
    const messages = [{ role: 'system', content: systemPrompt }];
    history.forEach(msg => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        });
    });
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP status ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Respuesta vacía de Groq");
    return text;
}

// Lógica de Petición para Mistral API (Formato OpenAI compatible)
async function callMistralAPI(key, systemPrompt, prompt, history) {
    const url = 'https://api.mistral.ai/v1/chat/completions';
    
    const messages = [{ role: 'system', content: systemPrompt }];
    history.forEach(msg => {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.text
        });
    });
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
            model: 'open-mistral-7b',
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP status ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Respuesta vacía de Mistral");
    return text;
}
