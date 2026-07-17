// Gemini API Integration with Intelligent Key Rotation
const GEMINI_KEYS = [
    "AIzaSyC6m7hhObTbh1Gpga04uCvGagADFmrjkRM",
    "AIzaSyC93J1ozXUPTDI4k88fGABve1rS3YTx5LM",
    "AIzaSyCdPDpBgl9jT7b180ax5J1Z5dJi-wzp9WU",
    "AIzaSyD31aesmyMKTqqpmjrv_LH3bvufsnzicXI",
    "AIzaSyCMU-3-lBnAHqXH47CgE4wQaiYcQVda5J8",
    "AIzaSyCyVrPdTVEU1yx9Z9POqqju7LKoVQzH0H4"
];

let currentKeyIndex = 0;

/**
 * Envia una petición a la API de Gemini usando rotación de llaves en caso de error.
 * @param {string} prompt El mensaje del usuario.
 * @param {Array} history El historial de chat para mantener el contexto.
 * @param {string} activeCode El código actual que el usuario está editando.
 * @param {string} fileName El nombre del archivo activo.
 */
async function askGemini(prompt, history = [], activeCode = '', fileName = '') {
    const systemPrompt = `Eres un asistente de programación experto en AndroCode. 
Ayudas al usuario a programar en lenguajes como HTML, CSS, JavaScript, Python y Markdown directamente desde su celular.
Mantén tus respuestas claras, precisas y optimizadas para leerse en pantallas móviles.
Si el usuario provee código, analízalo con detalle.
Usa formato Markdown para las respuestas, y coloca bloques de código formateados con su lenguaje respectivo.
${activeCode ? `El archivo actual que el usuario está editando se llama "${fileName}" y contiene este código:\n\`\`\`\n${activeCode}\n\`\`\`` : ''}`;

    // Construir estructura del chat para Gemini (Contents array)
    const contents = [];
    
    // Agregar historial si existe
    history.forEach(msg => {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    });
    
    // Agregar el mensaje actual
    contents.push({
        role: 'user',
        parts: [{ text: prompt }]
    });

    // Intentar realizar la petición rotando llaves si falla
    for (let attempts = 0; attempts < GEMINI_KEYS.length; attempts++) {
        const key = GEMINI_KEYS[currentKeyIndex];
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        
        try {
            console.log(`Intentando llamar a Gemini con la clave index: ${currentKeyIndex}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: contents,
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP status ${response.status}`);
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!textResponse) {
                throw new Error("Respuesta vacía o formato inválido de la API");
            }

            return textResponse;

        } catch (error) {
            console.warn(`Error con la clave de Gemini index ${currentKeyIndex}:`, error.message);
            // Rotar a la siguiente clave
            currentKeyIndex = (currentKeyIndex + 1) % GEMINI_KEYS.length;
            
            // Si hemos probado todas las claves, lanzar error final
            if (attempts === GEMINI_KEYS.length - 1) {
                throw new Error("Todas las claves de la API de Gemini fallaron o están agotadas. Por favor, revisa tu conexión o las claves.");
            }
        }
    }
}
